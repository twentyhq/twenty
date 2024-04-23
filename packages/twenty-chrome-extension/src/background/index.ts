import { openOptionsPage } from '~/background/utils/openOptionsPage';
import { isDefined } from '~/utils/isDefined';

// Open options page programmatically in a new tab.
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    openOptionsPage();
  }
});

// Open options page when extension icon is clicked.
chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id ?? 0, { action: 'TOGGLE' });
});

// This listens for an event from other parts of the extension, such as the content script, and performs the required tasks.
// The cases themselves are labelled such that their operations are reflected by their names.
chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  switch (message.action) {
    case 'getActiveTab': // e.g. "https://linkedin.com/company/twenty/"
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (isDefined(tabs) && isDefined(tabs[0])) {
          sendResponse({ tab: tabs[0] });
        }
      });
      break;
    case 'openOptionsPage':
      openOptionsPage();
      break;
    default:
      break;
  }

  return true;
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  const isDesiredRoute =
    tab.url?.match(/^https?:\/\/(?:www\.)?linkedin\.com\/company(?:\/\S+)?/) ||
    tab.url?.match(/^https?:\/\/(?:www\.)?linkedin\.com\/in(?:\/\S+)?/);

  if (changeInfo.status === 'complete' && tab.active) {
    if (isDefined(isDesiredRoute)) {
      chrome.tabs.sendMessage(tabId, { action: 'executeContentScript' });
    }
  }
});
