import { type AppConnection, listConnections } from 'twenty-sdk/logic-function';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { googleMeetQueueConnectionDiscoveriesHandler } from 'src/logic-functions/google-meet-queue-connection-discoveries';
import { enqueueGoogleMeetDiscoveriesOrThrow } from 'src/logic-functions/utils/enqueue-google-meet-discoveries-or-throw.util';

vi.mock('twenty-sdk/logic-function', () => ({ listConnections: vi.fn() }));

vi.mock(
  'src/logic-functions/utils/enqueue-google-meet-discoveries-or-throw.util',
  () => ({ enqueueGoogleMeetDiscoveriesOrThrow: vi.fn() }),
);

const NOW = new Date('2026-11-17T10:17:00Z');

const buildConnection = ({
  id,
  authFailedAt = null,
}: Pick<AppConnection, 'id'> &
  Partial<Pick<AppConnection, 'authFailedAt'>>): AppConnection => ({
  id,
  providerName: 'google-meet-user',
  providerType: 'oauth',
  name: 'Google Meet',
  handle: 'ada@example.com',
  externalAccountId: null,
  scope: 'USER',
  visibility: 'user',
  userWorkspaceId: 'user-workspace-id',
  workspaceMemberId: null,
  scopes: [],
  authFailedAt,
  authFailedReason: null,
  accessToken: 'token',
});

describe('googleMeetQueueConnectionDiscoveriesHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should queue a discovery for each connection that can still sign in', async () => {
    vi.mocked(listConnections).mockResolvedValue([
      buildConnection({ id: 'first' }),
      buildConnection({ id: 'expired', authFailedAt: '2026-11-16T08:00:00Z' }),
      buildConnection({ id: 'second' }),
    ]);

    await expect(
      googleMeetQueueConnectionDiscoveriesHandler(),
    ).resolves.toEqual({
      success: true,
      queuedCount: 2,
      reconnectRequiredCount: 1,
    });

    expect(listConnections).toHaveBeenCalledExactlyOnceWith({
      providerName: 'google-meet-user',
    });
    expect(enqueueGoogleMeetDiscoveriesOrThrow).toHaveBeenCalledExactlyOnceWith(
      {
        connectedAccountIds: ['first', 'second'],
        trigger: 'schedule',
        now: NOW,
      },
    );
  });

  it('should queue nothing when no account is connected', async () => {
    vi.mocked(listConnections).mockResolvedValue([]);

    await expect(
      googleMeetQueueConnectionDiscoveriesHandler(),
    ).resolves.toEqual({
      success: true,
      queuedCount: 0,
      reconnectRequiredCount: 0,
    });

    expect(enqueueGoogleMeetDiscoveriesOrThrow).toHaveBeenCalledExactlyOnceWith(
      {
        connectedAccountIds: [],
        trigger: 'schedule',
        now: NOW,
      },
    );
  });
});
