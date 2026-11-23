import { getSystemNotificationSettings } from '@/web-push/utils/getSystemNotificationSettings';

const MAC_CHROME_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const MAC_EDGE_USER_AGENT = `${MAC_CHROME_USER_AGENT} Edg/131.0.0.0`;
const MAC_FIREFOX_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:133.0) Gecko/20100101 Firefox/133.0';
const MAC_SAFARI_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15';
const WINDOWS_CHROME_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const LINUX_CHROME_USER_AGENT =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const MAC_NOTIFICATION_SETTINGS_URL =
  'x-apple.systempreferences:com.apple.preference.notifications';

const mockUserAgent = (userAgent: string) =>
  jest.spyOn(navigator, 'userAgent', 'get').mockReturnValue(userAgent);

describe('getSystemNotificationSettings', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    Reflect.deleteProperty(navigator, 'brave');
    Reflect.deleteProperty(navigator, 'maxTouchPoints');
  });

  it.each([
    [
      'Chrome on Mac',
      MAC_CHROME_USER_AGENT,
      {
        operatingSystem: 'mac',
        browserName: 'Google Chrome',
        settingsEntryName: 'Google Chrome',
        url: `${MAC_NOTIFICATION_SETTINGS_URL}?id=com.google.Chrome`,
      },
    ],
    [
      'Edge on Mac',
      MAC_EDGE_USER_AGENT,
      {
        operatingSystem: 'mac',
        browserName: 'Microsoft Edge',
        settingsEntryName: 'Microsoft Edge',
        url: `${MAC_NOTIFICATION_SETTINGS_URL}?id=com.microsoft.edgemac`,
      },
    ],
    [
      'Firefox on Mac',
      MAC_FIREFOX_USER_AGENT,
      {
        operatingSystem: 'mac',
        browserName: 'Firefox',
        settingsEntryName: 'Firefox',
        url: `${MAC_NOTIFICATION_SETTINGS_URL}?id=org.mozilla.firefox`,
      },
    ],
    [
      'Safari on Mac',
      MAC_SAFARI_USER_AGENT,
      {
        operatingSystem: 'mac',
        browserName: 'Safari',
        settingsEntryName: 'Twenty',
        url: MAC_NOTIFICATION_SETTINGS_URL,
      },
    ],
    [
      'Chrome on Windows',
      WINDOWS_CHROME_USER_AGENT,
      {
        operatingSystem: 'windows',
        browserName: 'Google Chrome',
        settingsEntryName: 'Google Chrome',
        url: 'ms-settings:notifications',
      },
    ],
    [
      'Chrome on Linux',
      LINUX_CHROME_USER_AGENT,
      { operatingSystem: 'other', browserName: 'Google Chrome' },
    ],
  ])('should describe %s', (_label, userAgent, expectedSettings) => {
    mockUserAgent(userAgent);

    expect(getSystemNotificationSettings()).toEqual(expectedSettings);
  });

  it('should describe Brave on Mac', () => {
    mockUserAgent(MAC_CHROME_USER_AGENT);
    Object.defineProperty(navigator, 'brave', {
      value: {},
      configurable: true,
    });

    expect(getSystemNotificationSettings()).toEqual({
      operatingSystem: 'mac',
      browserName: 'Brave',
      settingsEntryName: 'Brave Browser',
      url: `${MAC_NOTIFICATION_SETTINGS_URL}?id=com.brave.Browser`,
    });
  });

  it('should not link to macOS settings on an iPad', () => {
    mockUserAgent(MAC_SAFARI_USER_AGENT);
    Object.defineProperty(navigator, 'maxTouchPoints', {
      value: 5,
      configurable: true,
    });

    expect(getSystemNotificationSettings()).toEqual({
      operatingSystem: 'other',
      browserName: 'Safari',
    });
  });
});
