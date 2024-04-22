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
    case 'CONNECT':
      launchOAuth(({ status, message }) => {
        sendResponse({ status, message });
      });
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

const launchOAuth = (
  callback: ({ status, message }: { status: boolean; message: string }) => void,
) => {
  const { codeVerifier, codeChallenge } = generateCodeVerifierAndChallenge();
  const redirectUrl = chrome.identity.getRedirectURL();
  chrome.identity
    .launchWebAuthFlow({
      url: `${
        import.meta.env.VITE_FRONT_BASE_URL
      }/authorize?clientId=chrome&codeChallenge=${codeChallenge}&redirectUrl=${redirectUrl}`,
      interactive: true,
    })
    .then((responseUrl) => {
      if (typeof responseUrl === 'string') {
        const url = new URL(responseUrl);
        const authorizationCode = url.searchParams.get(
          'authorizationCode',
        ) as string;
        exchangeAuthorizationCode({
          authorizationCode,
          codeVerifier,
        }).then((tokens) => {
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

            callback({ status: true, message: '' });

            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
              if (isDefined(tabs) && isDefined(tabs[0])) {
                chrome.tabs.sendMessage(tabs[0].id ?? 0, {
                  action: 'AUTHENTICATED',
                });
              }
            });
          }
        });
      }
    })
    .catch((error) => {
      callback({ status: false, message: error.message });
    });
};

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
