import { kv } from 'twenty-sdk/logic-function';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { claimMeetEventSubscription } from 'src/logic-functions/utils/claim-meet-event-subscription.util';
import { releaseMeetEventSubscription } from 'src/logic-functions/utils/release-meet-event-subscription.util';
import { storeMeetConnectionSubscription } from 'src/logic-functions/utils/store-meet-connection-subscription.util';

vi.mock('twenty-sdk/logic-function', () => ({
  kv: { get: vi.fn(), set: vi.fn() },
}));

vi.mock(
  'src/logic-functions/utils/claim-meet-event-subscription.util',
  () => ({ claimMeetEventSubscription: vi.fn() }),
);

vi.mock(
  'src/logic-functions/utils/release-meet-event-subscription.util',
  () => ({ releaseMeetEventSubscription: vi.fn() }),
);

const CONNECTION_SUBSCRIPTION_KEY =
  'google-meet-connection-subscription:connected-account-id';

const SUBSCRIPTION_TO_STORE = {
  connectedAccountId: 'connected-account-id',
  subscriptionName: 'subscriptions/first',
  replacedSubscriptionName: undefined,
};

describe('storeMeetConnectionSubscription', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(kv.get).mockResolvedValue(null);
  });

  it('should claim the subscription for the workspace and link it to the connection', async () => {
    await storeMeetConnectionSubscription(SUBSCRIPTION_TO_STORE);

    expect(kv.get).toHaveBeenCalledExactlyOnceWith(CONNECTION_SUBSCRIPTION_KEY);
    expect(claimMeetEventSubscription).toHaveBeenCalledExactlyOnceWith(
      'subscriptions/first',
    );
    expect(vi.mocked(kv.set).mock.calls).toEqual([
      [
        'google-meet-event-subscription:subscriptions/first',
        'connected-account-id',
      ],
      [CONNECTION_SUBSCRIPTION_KEY, 'subscriptions/first'],
    ]);
    expect(releaseMeetEventSubscription).not.toHaveBeenCalled();
  });

  it('should release the subscription the connection had before', async () => {
    vi.mocked(kv.get).mockResolvedValue('subscriptions/previous');

    await storeMeetConnectionSubscription(SUBSCRIPTION_TO_STORE);

    expect(releaseMeetEventSubscription).toHaveBeenCalledExactlyOnceWith({
      connectedAccountId: 'connected-account-id',
      subscriptionName: 'subscriptions/previous',
    });
  });

  it('should release the subscription that was replaced, once', async () => {
    vi.mocked(kv.get).mockResolvedValue('subscriptions/replaced');

    await storeMeetConnectionSubscription({
      ...SUBSCRIPTION_TO_STORE,
      replacedSubscriptionName: 'subscriptions/replaced',
    });

    expect(releaseMeetEventSubscription).toHaveBeenCalledExactlyOnceWith({
      connectedAccountId: 'connected-account-id',
      subscriptionName: 'subscriptions/replaced',
    });
  });

  it('should keep the subscription when the connection is registered again', async () => {
    vi.mocked(kv.get).mockResolvedValue('subscriptions/first');

    await storeMeetConnectionSubscription({
      ...SUBSCRIPTION_TO_STORE,
      replacedSubscriptionName: 'subscriptions/first',
    });

    expect(releaseMeetEventSubscription).not.toHaveBeenCalled();
  });

  it('should keep the previous subscription on record when its release fails', async () => {
    const releaseError = new Error('Google is unavailable');

    vi.mocked(kv.get).mockResolvedValue('subscriptions/previous');
    vi.mocked(releaseMeetEventSubscription).mockRejectedValueOnce(
      releaseError,
    );

    await expect(
      storeMeetConnectionSubscription(SUBSCRIPTION_TO_STORE),
    ).rejects.toBe(releaseError);

    expect(kv.set).not.toHaveBeenCalledWith(
      CONNECTION_SUBSCRIPTION_KEY,
      'subscriptions/first',
    );
  });
});
