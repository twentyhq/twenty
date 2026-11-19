import { enqueueJobs, listConnections } from 'twenty-sdk/logic-function';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  OTHER_CONNECTION,
  OWN_CONNECTION,
} from 'src/__tests__/utils/granola-personal-connection-fixtures';
import {
  GRANOLA_PERSONAL_CATCH_UP_WORKER_UNIVERSAL_IDENTIFIER,
  GRANOLA_PERSONAL_RECONCILE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { granolaPersonalDailyCatchUpHandler } from 'src/logic-functions/granola-personal-daily-catch-up';
import { getGranolaApiKeyFingerprint } from 'src/logic-functions/utils/get-granola-api-key-fingerprint.util';

vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<typeof import('twenty-sdk/logic-function')>()),
  enqueueJobs: vi.fn(),
  listConnections: vi.fn(),
}));

afterEach(() => {
  vi.resetAllMocks();
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

describe('granolaPersonalDailyCatchUpHandler', () => {
  it('leaves recovery dormant before activation', async () => {
    vi.stubEnv('GRANOLA_PERSONAL_SYNC_ENABLED', undefined);

    await expect(granolaPersonalDailyCatchUpHandler()).resolves.toEqual({
      success: true,
      skipped: true,
    });
    expect(listConnections).not.toHaveBeenCalled();
    expect(enqueueJobs).not.toHaveBeenCalled();
  });

  it('schedules only active personal accounts with stable job IDs', async () => {
    vi.stubEnv('GRANOLA_PERSONAL_SYNC_ENABLED', 'true');
    vi.useFakeTimers();
    vi.setSystemTime('2026-11-19T04:30:00.000Z');
    vi.mocked(listConnections).mockResolvedValue([
      OWN_CONNECTION,
      { ...OTHER_CONNECTION, workspaceMemberId: null },
    ]);
    vi.mocked(enqueueJobs).mockResolvedValue({
      enqueued: true,
      logicFunctionUniversalIdentifier:
        GRANOLA_PERSONAL_CATCH_UP_WORKER_UNIVERSAL_IDENTIFIER,
      enqueuedJobsCount: 1,
      jobIds: [],
      jobs: [],
    });

    await expect(granolaPersonalDailyCatchUpHandler()).resolves.toMatchObject({
      enqueuedConnectionCount: 1,
    });
    await granolaPersonalDailyCatchUpHandler();

    const requests = vi
      .mocked(enqueueJobs)
      .mock.calls.map(([request]) => request);
    const apiKeyFingerprint = getGranolaApiKeyFingerprint(
      OWN_CONNECTION.accessToken ?? '',
    );

    expect(requests[0]).toMatchObject({
      logicFunctionUniversalIdentifier:
        GRANOLA_PERSONAL_CATCH_UP_WORKER_UNIVERSAL_IDENTIFIER,
      jobs: [
        {
          jobId: expect.any(String),
          payload: {
            kind: 'scan',
            pageIndex: 0,
            scope: {
              connectionId: OWN_CONNECTION.id,
              userWorkspaceId: OWN_CONNECTION.userWorkspaceId,
            },
            apiKeyFingerprint,
            updatedAfter: '2026-11-17T00:00:00.000Z',
          },
        },
      ],
    });
    expect(requests[1]).toMatchObject({
      logicFunctionUniversalIdentifier:
        GRANOLA_PERSONAL_RECONCILE_UNIVERSAL_IDENTIFIER,
      jobs: [
        {
          jobId: expect.any(String),
          payload: {
            connectedAccountId: OWN_CONNECTION.id,
            userWorkspaceId: OWN_CONNECTION.userWorkspaceId,
            scheduledApiKeyFingerprint: apiKeyFingerprint,
          },
        },
      ],
    });
    expect(requests.slice(2)).toEqual(requests.slice(0, 2));
  });
});
