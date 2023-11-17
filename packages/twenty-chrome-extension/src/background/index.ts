console.log('Background Script Works');

chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason === 'install') {
    // Open options page programmatically in a new tab.
    chrome.runtime.openOptionsPage();
  }
});
