import Crypto from 'crypto-js';

import { openOptionsPage } from '~/background/utils/openOptionsPage';
import { exchangeAuthorizationCode } from '~/db/auth.db';
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
    case 'getActiveTabUrl': // e.g. "https://linkedin.com/company/twenty/"
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (isDefined(tabs) && isDefined(tabs[0])) {
          const activeTabUrl: string | undefined = tabs[0].url;
          sendResponse({ url: activeTabUrl });
        }
      });
      break;
    case 'openOptionsPage':
      openOptionsPage();
      break;
    case 'CONNECT':
      launchOAuth();
      break;
    default:
      break;
  }

  return true;
});

const generateRandomString = (length: number) => {
  const charset =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
};

const generateCodeVerifierAndChallenge = () => {
  const codeVerifier = generateRandomString(32);
  const hash = Crypto.SHA256(codeVerifier);
  const codeChallenge = hash
    .toString(Crypto.enc.Base64)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return { codeVerifier, codeChallenge };
};

const launchOAuth = () => {
  const { codeVerifier, codeChallenge } = generateCodeVerifierAndChallenge();
  chrome.identity.launchWebAuthFlow(
    {
      url: `${
        import.meta.env.VITE_FRONT_BASE_URL
      }/authorize?clientId=chrome&codeChallenge=${codeChallenge}`,
      interactive: true,
    },
    async (responseUrl) => {
      if (typeof responseUrl === 'string') {
        const url = new URL(responseUrl);
        const authorizationCode = url.searchParams.get(
          'authorizationCode',
        ) as string;
        const tokens = await exchangeAuthorizationCode({
          authorizationCode,
          codeVerifier,
        });
        if (isDefined(tokens)) {
          chrome.storage.local.set({
            loginToken: tokens.loginToken,
          });

          chrome.storage.local.set({
            accessToken: tokens.accessToken,
          });

          chrome.storage.local.set({
            refreshToken: tokens.refreshToken,
          });

          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (isDefined(tabs) && isDefined(tabs[0])) {
              chrome.tabs.sendMessage(tabs[0].id ?? 0, {
                action: 'AUTHENTICATED',
              });
            }
          });
        }
      }
    },
  );
};

// Keep track of the tabs in which the "Add to Twenty" button has already been injected.
// Could be that the content script is executed at "https://linkedin.com/feed/", but is needed at "https://linkedin.com/in/mabdullahabaid/".
// However, since Linkedin is a SPA, the script would not be re-executed when you navigate to "https://linkedin.com/in/mabdullahabaid/" from a user action.
// Therefore, this tracks if the user is on desired route and then re-executes the content script to create the "Add to Twenty" button.
// We use a "Set" to keep track of tab ids because it could be that the "Add to Twenty" button was created at "https://linkedin/com/company/twenty".
// However, when we change to about on the company page, the url becomes "https://www.linkedin.com/company/twenty/about/" and the button is created again.
// This creates a duplicate button, which we want to avoid. So, we instruct the extension to only create the button once for any of the following urls.
// "https://www.linkedin.com/company/twenty/" "https://www.linkedin.com/company/twenty/about/" "https://www.linkedin.com/company/twenty/people/".
const injectedTabs: Set<number> = new Set();

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  const isDesiredRoute =
    tab.url?.match(/^https?:\/\/(?:www\.)?linkedin\.com\/company(?:\/\S+)?/) ||
    tab.url?.match(/^https?:\/\/(?:www\.)?linkedin\.com\/in(?:\/\S+)?/);

  if (changeInfo.status === 'complete' && tab.active) {
    if (isDefined(isDesiredRoute) && !isDefined(injectedTabs.has(tabId))) {
      chrome.tabs.sendMessage(tabId, { action: 'executeContentScript' });
      injectedTabs.add(tabId);
    } else if (!isDesiredRoute) {
      injectedTabs.delete(tabId); // Clear entry if navigated away from LinkedIn company page.
    }
  }
});
