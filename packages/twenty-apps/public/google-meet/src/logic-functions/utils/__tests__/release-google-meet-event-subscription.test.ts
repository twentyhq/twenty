import { getConnection, kv } from 'twenty-sdk/logic-function';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { deleteGoogleMeetEventSubscription } from 'src/logic-functions/utils/delete-google-meet-event-subscription.util';
import { releaseGoogleMeetEventSubscription } from 'src/logic-functions/utils/release-google-meet-event-subscription.util';

vi.mock('twenty-sdk/logic-function', () => ({
  getConnection: vi.fn(),
  kv: { delete: vi.fn() },
}));

vi.mock(
  'src/logic-functions/utils/delete-google-meet-event-subscription.util',
  () => ({ deleteGoogleMeetEventSubscription: vi.fn() }),
);

const SUBSCRIPTION_TO_RELEASE = {
  connectedAccountId: 'connected-account-id',
  subscriptionName: 'subscriptions/first',
};

const EVENT_SUBSCRIPTION_KEY =
  'google-meet-event-subscription:subscriptions/first';

describe('releaseGoogleMeetEventSubscription', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getConnection, { partial: true }).mockResolvedValue({
      id: 'connected-account-id',
      accessToken: 'token',
    });
  });

  it('should delete the subscription at Google, then forget who owns it', async () => {
    vi.mocked(deleteGoogleMeetEventSubscription).mockImplementationOnce(
      async () => {
        expect(kv.delete).not.toHaveBeenCalled();
      },
    );

    await releaseGoogleMeetEventSubscription(SUBSCRIPTION_TO_RELEASE);

    expect(getConnection).toHaveBeenCalledExactlyOnceWith(
      'connected-account-id',
    );
    expect(deleteGoogleMeetEventSubscription).toHaveBeenCalledExactlyOnceWith({
      accessToken: 'token',
      subscriptionName: 'subscriptions/first',
    });
    expect(vi.mocked(kv.delete).mock.calls).toEqual([
      [EVENT_SUBSCRIPTION_KEY],
      [EVENT_SUBSCRIPTION_KEY, { scope: 'SERVER' }],
    ]);
  });

  it('should release the claim even when the connection can no longer sign in', async () => {
    const connectionError = new Error('The connection must be reconnected');

    vi.mocked(getConnection).mockRejectedValueOnce(connectionError);

    await expect(
      releaseGoogleMeetEventSubscription(SUBSCRIPTION_TO_RELEASE),
    ).rejects.toBe(connectionError);

    expect(kv.delete).toHaveBeenCalledWith(EVENT_SUBSCRIPTION_KEY, {
      scope: 'SERVER',
    });
    expect(deleteGoogleMeetEventSubscription).not.toHaveBeenCalled();
  });

  it('should release the claim even when Google cannot delete the subscription', async () => {
    const googleError = new Error('Google is unavailable');

    vi.mocked(deleteGoogleMeetEventSubscription).mockRejectedValueOnce(
      googleError,
    );

    await expect(
      releaseGoogleMeetEventSubscription(SUBSCRIPTION_TO_RELEASE),
    ).rejects.toBe(googleError);

    expect(kv.delete).toHaveBeenCalledWith(EVENT_SUBSCRIPTION_KEY, {
      scope: 'SERVER',
    });
  });
});
