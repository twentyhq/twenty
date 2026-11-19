import { Buffer } from 'buffer';
import { base64UrlEncode } from 'twenty-shared/utils';

import { getOrCreateBrowserWebPushSubscription } from '@/web-push/utils/getOrCreateBrowserWebPushSubscription';

const VAPID_PUBLIC_KEY_BYTES = new Uint8Array([4, 1, 2, 3]);
const VAPID_PUBLIC_KEY = base64UrlEncode(Buffer.from(VAPID_PUBLIC_KEY_BYTES));
const OTHER_VAPID_PUBLIC_KEY_BYTES = new Uint8Array([4, 9, 9, 9]);

const createSubscription = (applicationServerKey: ArrayBuffer | null) => ({
  options: { applicationServerKey },
  unsubscribe: jest.fn().mockResolvedValue(true),
});

const mockServiceWorker = (
  existingSubscription: ReturnType<typeof createSubscription> | null,
) => {
  const createdSubscription = createSubscription(VAPID_PUBLIC_KEY_BYTES.buffer);
  const pushManager = {
    getSubscription: jest.fn().mockResolvedValue(existingSubscription),
    subscribe: jest.fn().mockResolvedValue(createdSubscription),
  };

  Object.defineProperty(navigator, 'serviceWorker', {
    configurable: true,
    value: {
      register: jest.fn().mockResolvedValue({}),
      ready: Promise.resolve({ pushManager }),
    },
  });

  return { pushManager, createdSubscription };
};

describe('getOrCreateBrowserWebPushSubscription', () => {
  afterEach(() => {
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: undefined,
    });
  });

  it('should subscribe through the active registration when none exists', async () => {
    const { pushManager, createdSubscription } = mockServiceWorker(null);

    const subscription =
      await getOrCreateBrowserWebPushSubscription(VAPID_PUBLIC_KEY);

    expect(navigator.serviceWorker.register).toHaveBeenCalledWith(
      '/service-worker.js',
    );
    expect(pushManager.subscribe).toHaveBeenCalledWith({
      userVisibleOnly: true,
      applicationServerKey: VAPID_PUBLIC_KEY,
    });
    expect(subscription).toBe(createdSubscription);
  });

  it('should reuse the subscription made with the same VAPID public key', async () => {
    const existingSubscription = createSubscription(
      VAPID_PUBLIC_KEY_BYTES.buffer,
    );
    const { pushManager } = mockServiceWorker(existingSubscription);

    const subscription =
      await getOrCreateBrowserWebPushSubscription(VAPID_PUBLIC_KEY);

    expect(subscription).toBe(existingSubscription);
    expect(existingSubscription.unsubscribe).not.toHaveBeenCalled();
    expect(pushManager.subscribe).not.toHaveBeenCalled();
  });

  it.each([
    ['another VAPID public key', OTHER_VAPID_PUBLIC_KEY_BYTES.buffer],
    ['no VAPID public key', null],
  ])(
    'should replace a subscription made with %s',
    async (_, applicationServerKey) => {
      const existingSubscription = createSubscription(applicationServerKey);
      const { pushManager, createdSubscription } =
        mockServiceWorker(existingSubscription);

      const subscription =
        await getOrCreateBrowserWebPushSubscription(VAPID_PUBLIC_KEY);

      expect(existingSubscription.unsubscribe).toHaveBeenCalled();
      expect(pushManager.subscribe).toHaveBeenCalled();
      expect(subscription).toBe(createdSubscription);
    },
  );
});
