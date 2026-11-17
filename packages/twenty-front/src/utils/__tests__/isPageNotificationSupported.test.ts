import { isPageNotificationSupported } from '~/utils/isPageNotificationSupported';

const DESKTOP_CHROME_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
const ANDROID_CHROME_USER_AGENT =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36';

const setUserAgent = (userAgent: string) =>
  jest.spyOn(navigator, 'userAgent', 'get').mockReturnValue(userAgent);

describe('isPageNotificationSupported', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    Reflect.deleteProperty(globalThis, 'Notification');
  });

  it('should support a desktop browser with the Notification API', () => {
    Object.defineProperty(globalThis, 'Notification', {
      value: class {},
      configurable: true,
    });
    setUserAgent(DESKTOP_CHROME_USER_AGENT);

    expect(isPageNotificationSupported()).toBe(true);
  });

  it('should not support Android, where only service workers can notify', () => {
    Object.defineProperty(globalThis, 'Notification', {
      value: class {},
      configurable: true,
    });
    setUserAgent(ANDROID_CHROME_USER_AGENT);

    expect(isPageNotificationSupported()).toBe(false);
  });

  it('should not support a browser without the Notification API', () => {
    setUserAgent(DESKTOP_CHROME_USER_AGENT);

    expect(isPageNotificationSupported()).toBe(false);
  });
});
