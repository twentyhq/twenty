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

const setTokenStateFromCookie = (cookie: string) => {
  const decodedValue = decodeURIComponent(cookie);
  const tokenPair = JSON.parse(decodedValue);
  if (isDefined(tokenPair)) {
    chrome.storage.local.set({
      isAuthenticated: true,
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
    });
  }
};

chrome.cookies.onChanged.addListener(async ({ cookie }) => {
  if (cookie.name === 'tokenPair') {
    const store = await chrome.storage.local.get(['clientUrl']);
    const clientUrl = isDefined(store.clientUrl)
      ? store.clientUrl
      : import.meta.env.VITE_FRONT_BASE_URL;
    chrome.cookies.get({ name: 'tokenPair', url: `${clientUrl}` }, (cookie) => {
      if (isDefined(cookie)) {
        setTokenStateFromCookie(cookie.value);
      }
    });
  }
});

// This will only run the very first time the extension loads, after we have stored the
// cookiesRead variable to true, this will not allow to change the token state everytime background script runs
chrome.cookies.get(
  { name: 'tokenPair', url: `${import.meta.env.VITE_FRONT_BASE_URL}` },
  async (cookie) => {
    const store = await chrome.storage.local.get(['cookiesRead']);
    if (isDefined(cookie) && !isDefined(store.cookiesRead)) {
      setTokenStateFromCookie(cookie.value);
      chrome.storage.local.set({ cookiesRead: true });
    }
  },
);
