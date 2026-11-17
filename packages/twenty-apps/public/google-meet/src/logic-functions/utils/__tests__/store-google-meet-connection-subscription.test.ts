import { kv } from 'twenty-sdk/logic-function';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { storeGoogleMeetConnectionSubscription } from 'src/logic-functions/utils/store-google-meet-connection-subscription.util';

vi.mock('twenty-sdk/logic-function', () => ({
  kv: { get: vi.fn(), set: vi.fn(), delete: vi.fn() },
}));

describe('storeGoogleMeetConnectionSubscription', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should claim the subscription for the workspace and link it to the connection', async () => {
    vi.mocked(kv.get).mockResolvedValue(null);

    await storeGoogleMeetConnectionSubscription({
      connectedAccountId: 'connected-account-id',
      subscriptionName: 'subscriptions/first',
    });

    expect(vi.mocked(kv.set).mock.calls).toEqual([
      [
        'google-meet-event-subscription:subscriptions/first',
        null,
        { scope: 'SERVER' },
      ],
      [
        'google-meet-event-subscription:subscriptions/first',
        'connected-account-id',
      ],
      [
        'google-meet-connection-subscription:connected-account-id',
        'subscriptions/first',
      ],
    ]);
    expect(kv.delete).not.toHaveBeenCalled();
  });

  it('should release the subscription the connection had before', async () => {
    vi.mocked(kv.get).mockResolvedValue('subscriptions/previous');

    await storeGoogleMeetConnectionSubscription({
      connectedAccountId: 'connected-account-id',
      subscriptionName: 'subscriptions/first',
    });

    expect(kv.get).toHaveBeenCalledExactlyOnceWith(
      'google-meet-connection-subscription:connected-account-id',
    );
    expect(vi.mocked(kv.delete).mock.calls).toEqual([
      ['google-meet-event-subscription:subscriptions/previous'],
      [
        'google-meet-event-subscription:subscriptions/previous',
        { scope: 'SERVER' },
      ],
    ]);
  });

  it('should keep the subscription when the connection is registered again', async () => {
    vi.mocked(kv.get).mockResolvedValue('subscriptions/first');

    await storeGoogleMeetConnectionSubscription({
      connectedAccountId: 'connected-account-id',
      subscriptionName: 'subscriptions/first',
    });

    expect(kv.delete).not.toHaveBeenCalled();
  });
});
