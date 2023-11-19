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

const injectedTabs: Set<number> = new Set();

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  const isDesiredRoute = tab.url?.match(/^https?:\/\/(?:www\.)?linkedin\.com\/company(?:\/\S+)?/) || tab.url?.match(/^https?:\/\/(?:www\.)?linkedin\.com\/in(?:\/\S+)?/);

  if (changeInfo.status === 'complete' && tab.active) {
    if (isDesiredRoute && !injectedTabs.has(tabId)) {
      chrome.tabs.sendMessage(tabId, { action: 'executeContentScript' });
      injectedTabs.add(tabId);
    } else if (!isDesiredRoute) {
      injectedTabs.delete(tabId); // Clear entry if navigated away from LinkedIn company page
    }
  }
});
