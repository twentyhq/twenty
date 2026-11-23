import { kv } from 'twenty-sdk/logic-function';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { claimGoogleMeetEventSubscription } from 'src/logic-functions/utils/claim-google-meet-event-subscription.util';

vi.mock('twenty-sdk/logic-function', () => ({ kv: { set: vi.fn() } }));

describe('claimGoogleMeetEventSubscription', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should claim the subscription for the workspace on the whole server', async () => {
    await claimGoogleMeetEventSubscription('subscriptions/first');

    expect(kv.set).toHaveBeenCalledExactlyOnceWith(
      'google-meet-event-subscription:subscriptions/first',
      null,
      { scope: 'SERVER' },
    );
  });
});
