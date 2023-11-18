console.log('Background Script Works');

chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason === 'install') {
    // Open options page programmatically in a new tab.
    chrome.runtime.openOptionsPage();
  }
});

chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
  if (request.message === 'getActiveTabUrl') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0]) {
        const activeTabUrl: string | undefined = tabs[0].url;
        sendResponse({ url: activeTabUrl });
      }
    });
    return true; // Indicates an asynchronous response
  }
});
