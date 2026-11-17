import { type AppConnection, listConnections } from 'twenty-sdk/logic-function';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  GOOGLE_MEET_QUEUE_CONFERENCE_IMPORTS_UNIVERSAL_IDENTIFIER,
  GOOGLE_MEET_REGISTER_CONNECTION_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { googleMeetRefreshConnectionsHandler } from 'src/logic-functions/google-meet-refresh-connections';
import { enqueueGoogleMeetDailyJobsOrThrow } from 'src/logic-functions/utils/enqueue-google-meet-daily-jobs-or-throw.util';
import { getRandomDelayMilliseconds } from 'src/logic-functions/utils/get-random-delay-milliseconds.util';

vi.mock('twenty-sdk/logic-function', () => ({ listConnections: vi.fn() }));

vi.mock(
  'src/logic-functions/utils/enqueue-google-meet-daily-jobs-or-throw.util',
  () => ({ enqueueGoogleMeetDailyJobsOrThrow: vi.fn() }),
);

vi.mock('src/logic-functions/utils/get-random-delay-milliseconds.util', () => ({
  getRandomDelayMilliseconds: vi.fn(),
}));

const NOW = new Date('2026-11-17T03:23:00Z');
const HALF_AN_HOUR_IN_MILLISECONDS = 30 * 60 * 1_000;

const buildConnection = ({
  id,
  authFailedAt,
}: Pick<AppConnection, 'id' | 'authFailedAt'>): AppConnection => ({
  id,
  providerName: 'google-meet-user',
  providerType: 'oauth',
  name: 'Google Meet',
  handle: 'ada@example.com',
  externalAccountId: '1234567890',
  scope: 'USER',
  visibility: 'user',
  userWorkspaceId: 'user-workspace-id',
  workspaceMemberId: null,
  scopes: [],
  authFailedAt,
  authFailedReason: null,
  accessToken: 'token',
});

describe('googleMeetRefreshConnectionsHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    vi.mocked(getRandomDelayMilliseconds).mockReturnValue(
      HALF_AN_HOUR_IN_MILLISECONDS,
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should queue a renewal and a catch-up for each connection that can still sign in', async () => {
    vi.mocked(listConnections).mockResolvedValue([
      buildConnection({ id: 'first', authFailedAt: null }),
      buildConnection({ id: 'expired', authFailedAt: '2026-11-16T08:00:00Z' }),
      buildConnection({ id: 'second', authFailedAt: null }),
    ]);

    await expect(googleMeetRefreshConnectionsHandler()).resolves.toEqual({
      success: true,
      refreshedCount: 2,
      reconnectRequiredCount: 1,
    });

    expect(listConnections).toHaveBeenCalledExactlyOnceWith({
      providerName: 'google-meet-user',
    });
    expect(getRandomDelayMilliseconds).toHaveBeenCalledExactlyOnceWith(
      60 * 60 * 1_000,
    );
    expect(vi.mocked(enqueueGoogleMeetDailyJobsOrThrow).mock.calls).toEqual([
      [
        {
          logicFunctionUniversalIdentifier:
            GOOGLE_MEET_REGISTER_CONNECTION_UNIVERSAL_IDENTIFIER,
          jobName: 'renewal',
          connectedAccountIds: ['first', 'second'],
          now: NOW,
          delayMilliseconds: HALF_AN_HOUR_IN_MILLISECONDS,
        },
      ],
      [
        {
          logicFunctionUniversalIdentifier:
            GOOGLE_MEET_QUEUE_CONFERENCE_IMPORTS_UNIVERSAL_IDENTIFIER,
          jobName: 'catch-up',
          connectedAccountIds: ['first', 'second'],
          now: NOW,
          delayMilliseconds: HALF_AN_HOUR_IN_MILLISECONDS,
        },
      ],
    ]);
  });

  it('should report no refresh when no account is connected', async () => {
    vi.mocked(listConnections).mockResolvedValue([]);

    await expect(googleMeetRefreshConnectionsHandler()).resolves.toEqual({
      success: true,
      refreshedCount: 0,
      reconnectRequiredCount: 0,
    });
  });
});
