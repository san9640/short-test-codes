// 시작 시점에는 메뉴 팝업이 로드가 완료가 안되어있는 탓인지, 제대로 못긁어와서 일단 비워둠
let removeBtn

// 이미 시청한 동영상의 메뉴 팝업용 버튼 수집
function gatherSeenVideoButtons() {
    const gatherLoopMaxCount = 10;
    // 나중에 보기 리스트에 있는 Content 접근
    // 결국 지워질 것이기 때문에, 캐싱해두더라도 내부 풀링 방식에 따라 순서가 달라질 것으로 예상해 매번 긁어오는 것으로 함
    let playList = document.querySelectorAll('ytd-playlist-video-renderer.style-scope.ytd-playlist-video-list-renderer');
    
    let seenButtonsList = [];

    // 순서가 보장되어있다는 가정 하에 앞에서부터 순회
    for (var content of playList)
    {
        // 시청한 동영상의 경우 빨간 프로그래스 바가 썸네일 하단에 뜨는데, 이 Content가 존재할 때만 삭제해야 함
        var progressBar = content.getElementsByClassName('ytd-thumbnail-overlay-resume-playback-renderer');
        
        // 만약 긁어온 데이터가 있는 경우
        if (progressBar.length > 0) {
            let titleContent = content.querySelector('#video-title.ytd-playlist-video-renderer');
            
            // 처리 기록 시각화를 위해 영상 제목 출력
            console.log('Found Seen Video : ' + titleContent.title)
            
            // 메뉴 버튼 접근
            let menuButton = content.querySelector('yt-icon.style-scope.ytd-menu-renderer');
        
            if (menuButton) {
                seenButtonsList.push(menuButton);
                
                // 적당히 수집되었으면 탈출
                // 예기치 못한 오류가 생겼을 때 빠르게 대응하기 위해 N개씩만 처리
                if (seenButtonsList.length >= gatherLoopMaxCount) {
                    break;
                }
            }
        }
        else {
            break;
        }
    }
    
    // 이번 수집 사이클에서 몇 개의 영상을 수집했는지 출력
    console.log('Found Seen Video Count In This Cycle : ' + seenButtonsList.length);
    
    return seenButtonsList
}

function buttonClicker(buttons) {
    if (buttons.length == 0) {
        return;
    }
    
    // 버튼 인덱스 체킹
    let buttonIndexWalker = 0;
    
    function removeNext() {
        buttons[buttonIndexWalker].click();
        
        // 버튼은 한번만 캐싱함.
        if (!removeBtn) {
            // FIXME : 시청 기록에서 삭제 버튼 긁어올 때 인덱스로 접근하는데, 추가 기능이 메뉴 팝업에 생겨버리면 정상동작하지 않을 것임
            removeBtn = document.querySelector('#items > ytd-menu-service-item-renderer:nth-child(3) > tp-yt-paper-item');
        }
        
        removeBtn.click();
        
        if (++buttonIndexWalker >= buttons.length) {
            // 한 사이클에서 몇 개가 처리되었는지 확인
            // 위와 로그와 같은 결과물이지만, 모종의 이유로(리스트가 너무 많아서 로드 중이라던지) 중간에 탈출하는 경우 어디까지 프로그래싱 됐는지 파악하기 위함
            console.log('Process Completed. Count : ' + buttons.length)
                
            // 재실행. 중간에 비정상 동작 중이진 않은지 확인하기 위해 2초 딜레이 넣었음
            setTimeout(gahterAndRemoveSeen, 2000);
        }
        else
        {
            // 적당히 기다려줌
            setTimeout(removeNext, 500)
        }
    }
    
    removeNext();
}

// 수집 후 삭제하는 작업
function gahterAndRemoveSeen() {
    let buttons = gatherSeenVideoButtons();
    
    buttonClicker(buttons)
}

gahterAndRemoveSeen();
