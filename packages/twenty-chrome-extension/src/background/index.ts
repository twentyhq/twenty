import Crypto from 'crypto-js';

import { exchangeAuthorizationCode } from '~/db/auth.db';
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
    case 'launchOAuth': {
      launchOAuth(({ status, message }) => {
        sendResponse({ status, message });
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

            chrome.tabs.query(
              { active: true, currentWindow: true },
              ([tab]) => {
                if (isDefined(tab) && isDefined(tab.id)) {
                  chrome.tabs.sendMessage(tab.id, {
                    action: 'executeContentScript',
                  });
                }
              },
            );
          }
        });
      }
    })
    .catch((error) => {
      callback({ status: false, message: error.message });
    });
};

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
