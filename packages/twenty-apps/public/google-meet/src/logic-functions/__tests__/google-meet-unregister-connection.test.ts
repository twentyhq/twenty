import { kv } from 'twenty-sdk/logic-function';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { googleMeetUnregisterConnectionHandler } from 'src/logic-functions/google-meet-unregister-connection';
import { releaseGoogleMeetEventSubscription } from 'src/logic-functions/utils/release-google-meet-event-subscription.util';

vi.mock('twenty-sdk/logic-function', () => ({
  kv: { get: vi.fn(), delete: vi.fn() },
}));

vi.mock(
  'src/logic-functions/utils/release-google-meet-event-subscription.util',
  () => ({ releaseGoogleMeetEventSubscription: vi.fn() }),
);

const CONNECTION_SUBSCRIPTION_KEY =
  'google-meet-connection-subscription:connected-account-id';
const EVENT_SUBSCRIPTION_KEY =
  'google-meet-event-subscription:subscriptions/first';

const mockStoredValues = (storedValues: Record<string, string>) =>
  vi
    .mocked(kv.get)
    .mockImplementation(async (key: string) => storedValues[key] ?? null);

describe('googleMeetUnregisterConnectionHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should delete the subscription of the removed connection', async () => {
    mockStoredValues({
      [CONNECTION_SUBSCRIPTION_KEY]: 'subscriptions/first',
      [EVENT_SUBSCRIPTION_KEY]: 'connected-account-id',
    });

    await expect(
      googleMeetUnregisterConnectionHandler({
        connectedAccountId: 'connected-account-id',
      }),
    ).resolves.toEqual({ success: true, isSubscriptionDeleted: true });

    expect(kv.delete).toHaveBeenCalledExactlyOnceWith(
      CONNECTION_SUBSCRIPTION_KEY,
    );
    expect(releaseGoogleMeetEventSubscription).toHaveBeenCalledExactlyOnceWith({
      connectedAccountId: 'connected-account-id',
      subscriptionName: 'subscriptions/first',
    });
  });

  it('should keep a subscription that another connection took over', async () => {
    mockStoredValues({
      [CONNECTION_SUBSCRIPTION_KEY]: 'subscriptions/first',
      [EVENT_SUBSCRIPTION_KEY]: 'other-connected-account-id',
    });

    await expect(
      googleMeetUnregisterConnectionHandler({
        connectedAccountId: 'connected-account-id',
      }),
    ).resolves.toEqual({ success: true, isSubscriptionDeleted: false });

    expect(kv.delete).toHaveBeenCalledExactlyOnceWith(
      CONNECTION_SUBSCRIPTION_KEY,
    );
    expect(releaseGoogleMeetEventSubscription).not.toHaveBeenCalled();
  });

  it('should do nothing for a connection without subscription', async () => {
    mockStoredValues({});

    await expect(
      googleMeetUnregisterConnectionHandler({
        connectedAccountId: 'connected-account-id',
      }),
    ).resolves.toEqual({ success: true, isSubscriptionDeleted: false });

    expect(kv.delete).not.toHaveBeenCalled();
    expect(releaseGoogleMeetEventSubscription).not.toHaveBeenCalled();
  });

  it('should refuse a hook without connection', async () => {
    await expect(googleMeetUnregisterConnectionHandler({})).resolves.toEqual({
      success: false,
      error: 'Invalid Google Meet connection hook',
    });

    expect(kv.get).not.toHaveBeenCalled();
  });
});
