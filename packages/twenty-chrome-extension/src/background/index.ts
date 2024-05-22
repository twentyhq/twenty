import { isDefined } from '~/utils/isDefined';

// Open options page programmatically in a new tab.
// chrome.runtime.onInstalled.addListener((details) => {
//   if (details.reason === 'install') {
//     openOptionsPage();
//   }
// });

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

// This listens for an event from other parts of the extension, such as the content script, and performs the required tasks.
// The cases themselves are labelled such that their operations are reflected by their names.
chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  switch (message.action) {
    case 'getActiveTab': {
      // e.g. "https://linkedin.com/company/twenty/"
      chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        if (isDefined(tab) && isDefined(tab.id)) {
          sendResponse({ tab });
        }
      });
      break;
    }
    case 'openSidepanel': {
      chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        if (isDefined(tab) && isDefined(tab.id)) {
          chrome.sidePanel.open({ tabId: tab.id });
        }
      });
      break;
    }
    case 'changeSidepanelUrl': {
      chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        if (isDefined(tab) && isDefined(tab.id)) {
          chrome.tabs.sendMessage(tab.id, {
            action: 'changeSidepanelUrl',
            message,
          });
        }
      });
      break;
    }
    default:
      break;
  }

  return true;
});

chrome.tabs.onUpdated.addListener(async (tabId, _, tab) => {
  const isDesiredRoute =
    tab.url?.match(/^https?:\/\/(?:www\.)?linkedin\.com\/company(?:\/\S+)?/) ||
    tab.url?.match(/^https?:\/\/(?:www\.)?linkedin\.com\/in(?:\/\S+)?/);

  if (tab.active === true) {
    if (isDefined(isDesiredRoute)) {
      chrome.tabs.sendMessage(tabId, { action: 'executeContentScript' });
    }
  }

  await chrome.sidePanel.setOptions({
    tabId,
    path: tab.url?.match(/^https?:\/\/(?:www\.)?linkedin\.com/)
      ? 'sidepanel.html'
      : 'page-inaccessible.html',
    enabled: true,
  });
});

chrome.cookies.onChanged.addListener(async ({ cookie }) => {
  if (cookie.name === 'tokenPair') {
    const decodedValue = decodeURIComponent(cookie.value);
    const tokenPair = JSON.parse(decodedValue);
    if (isDefined(tokenPair)) {
      chrome.storage.local.set({
        isAuthenticated: true,
        accessToken: tokenPair.accessToken,
        refreshToken: tokenPair.refreshToken,
      });
      chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        if (isDefined(tab) && isDefined(tab.id)) {
          chrome.tabs.sendMessage(tab.id, { action: 'executeContentScript' });
        }
      });
      chrome.runtime.sendMessage({ action: 'userIsLoggedIn' });
    }
  }
});
