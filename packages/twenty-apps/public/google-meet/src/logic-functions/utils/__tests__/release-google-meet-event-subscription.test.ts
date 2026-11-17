import { kv } from 'twenty-sdk/logic-function';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { deleteGoogleMeetEventSubscription } from 'src/logic-functions/utils/delete-google-meet-event-subscription.util';
import { releaseGoogleMeetEventSubscription } from 'src/logic-functions/utils/release-google-meet-event-subscription.util';

vi.mock('twenty-sdk/logic-function', () => ({ kv: { delete: vi.fn() } }));

vi.mock(
  'src/logic-functions/utils/delete-google-meet-event-subscription.util',
  () => ({ deleteGoogleMeetEventSubscription: vi.fn() }),
);

describe('releaseGoogleMeetEventSubscription', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should delete the subscription at Google and forget who owns it', async () => {
    await releaseGoogleMeetEventSubscription({
      accessToken: 'token',
      subscriptionName: 'subscriptions/first',
    });

    expect(deleteGoogleMeetEventSubscription).toHaveBeenCalledExactlyOnceWith({
      accessToken: 'token',
      subscriptionName: 'subscriptions/first',
    });
    expect(vi.mocked(kv.delete).mock.calls).toEqual([
      ['google-meet-event-subscription:subscriptions/first'],
      [
        'google-meet-event-subscription:subscriptions/first',
        { scope: 'SERVER' },
      ],
    ]);
  });

  it('should keep the owner when Google could not delete the subscription', async () => {
    const googleError = new Error('Google is unavailable');

    vi.mocked(deleteGoogleMeetEventSubscription).mockRejectedValueOnce(
      googleError,
    );

    await expect(
      releaseGoogleMeetEventSubscription({
        accessToken: 'token',
        subscriptionName: 'subscriptions/first',
      }),
    ).rejects.toBe(googleError);

    expect(kv.delete).not.toHaveBeenCalled();
  });
});
