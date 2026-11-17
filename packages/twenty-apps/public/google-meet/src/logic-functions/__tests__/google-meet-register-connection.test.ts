import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { googleMeetRegisterConnectionHandler } from 'src/logic-functions/google-meet-register-connection';
import { enqueueGoogleMeetDiscoveriesOrThrow } from 'src/logic-functions/utils/enqueue-google-meet-discoveries-or-throw.util';

vi.mock(
  'src/logic-functions/utils/enqueue-google-meet-discoveries-or-throw.util',
  () => ({ enqueueGoogleMeetDiscoveriesOrThrow: vi.fn() }),
);

const NOW = new Date('2026-11-17T10:20:00Z');

describe('googleMeetRegisterConnectionHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should queue a discovery for the account that was just connected', async () => {
    await expect(
      googleMeetRegisterConnectionHandler({
        connectedAccountId: 'connected-account-id',
      }),
    ).resolves.toEqual({ success: true });

    expect(enqueueGoogleMeetDiscoveriesOrThrow).toHaveBeenCalledExactlyOnceWith(
      {
        connectedAccountIds: ['connected-account-id'],
        trigger: 'connect',
        now: NOW,
      },
    );
  });

  it('should refuse a hook without connection', async () => {
    await expect(googleMeetRegisterConnectionHandler({})).resolves.toEqual({
      success: false,
      error: 'Invalid Google Meet connection hook',
    });

    expect(enqueueGoogleMeetDiscoveriesOrThrow).not.toHaveBeenCalled();
  });
});
