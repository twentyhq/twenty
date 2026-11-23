import { doNotTranslate } from 'twenty-shared/i18n';
import { isDefined } from 'twenty-shared/utils';
import { getUserDevice } from 'twenty-ui/utilities';

import { type SystemNotificationSettings } from '@/web-push/types/SystemNotificationSettings';

const MAC_NOTIFICATION_SETTINGS_URL =
  'x-apple.systempreferences:com.apple.preference.notifications';

const WINDOWS_NOTIFICATION_SETTINGS_URL = 'ms-settings:notifications';

// Brave reports a Chrome user agent, so it is detected from navigator.brave
const BRAVE_BROWSER = doNotTranslate({
  name: 'Brave',
  macBundleId: 'com.brave.Browser',
  macSettingsEntryName: 'Brave Browser',
});

// Order matters: Edge and Opera user agents contain "Chrome/", which contains "Safari/"
const BROWSERS = doNotTranslate([
  {
    userAgentToken: 'Edg/',
    name: 'Microsoft Edge',
    macBundleId: 'com.microsoft.edgemac',
  },
  { userAgentToken: 'OPR/', name: 'Opera', macBundleId: undefined },
  {
    userAgentToken: 'Firefox/',
    name: 'Firefox',
    macBundleId: 'org.mozilla.firefox',
  },
  {
    userAgentToken: 'Chrome/',
    name: 'Google Chrome',
    macBundleId: 'com.google.Chrome',
  },
  // Safari lists each website in macOS settings, not Safari itself
  {
    userAgentToken: 'Safari/',
    name: 'Safari',
    macBundleId: undefined,
    macSettingsEntryName: 'Twenty',
  },
]);

export const getSystemNotificationSettings = (): SystemNotificationSettings => {
  const device = getUserDevice();
  const browser =
    'brave' in navigator
      ? BRAVE_BROWSER
      : BROWSERS.find(({ userAgentToken }) =>
          navigator.userAgent.includes(userAgentToken),
        );
  // iPadOS Safari reports a Mac user agent
  const isTouchDevice = navigator.maxTouchPoints > 1;

  if (device === 'windows') {
    return {
      operatingSystem: 'windows',
      browserName: browser?.name,
      settingsEntryName: browser?.name,
      url: WINDOWS_NOTIFICATION_SETTINGS_URL,
    };
  }

  if (device === 'mac' && !isTouchDevice) {
    return {
      operatingSystem: 'mac',
      browserName: browser?.name,
      settingsEntryName: browser?.macSettingsEntryName ?? browser?.name,
      url: isDefined(browser?.macBundleId)
        ? `${MAC_NOTIFICATION_SETTINGS_URL}?id=${browser.macBundleId}`
        : MAC_NOTIFICATION_SETTINGS_URL,
    };
  }

  return { operatingSystem: 'other', browserName: browser?.name };
};
