import { enqueueJobs, listConnections } from 'twenty-sdk/logic-function';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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

beforeEach(() => {
  vi.mocked(enqueueJobs).mockImplementation(async (request) => ({
    enqueued: true,
    logicFunctionUniversalIdentifier: request.logicFunctionUniversalIdentifier,
    enqueuedJobsCount: request.jobs?.length ?? 0,
    jobIds: [],
    jobs: [],
  }));
});

afterEach(() => {
  vi.resetAllMocks();
  vi.useRealTimers();
});

describe('granolaPersonalDailyCatchUpHandler', () => {
  it('schedules nothing when there are no personal connections', async () => {
    vi.mocked(listConnections).mockResolvedValue([]);

    await expect(granolaPersonalDailyCatchUpHandler()).resolves.toEqual({
      success: true,
      enqueuedConnectionCount: 0,
    });
    expect(enqueueJobs).not.toHaveBeenCalled();
  });

  it('schedules only active personal accounts with job IDs independent of credentials', async () => {
    vi.useFakeTimers();
    vi.setSystemTime('2026-11-19T04:30:00.000Z');
    vi.mocked(listConnections).mockResolvedValue([
      OWN_CONNECTION,
      { ...OTHER_CONNECTION, workspaceMemberId: null },
    ]);
    await expect(granolaPersonalDailyCatchUpHandler()).resolves.toMatchObject({
      enqueuedConnectionCount: 1,
    });
    const rotatedAccessToken = 'grn_rotated_test_key';
    const rotatedFingerprint = getGranolaApiKeyFingerprint(rotatedAccessToken);
    vi.mocked(listConnections).mockResolvedValue([
      { ...OWN_CONNECTION, accessToken: rotatedAccessToken },
    ]);
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
    expect(requests[2]?.jobs?.[0]).toMatchObject({
      jobId: requests[0]?.jobs?.[0]?.jobId,
      payload: { apiKeyFingerprint: rotatedFingerprint },
    });
    expect(requests[3]?.jobs?.[0]).toMatchObject({
      jobId: requests[1]?.jobs?.[0]?.jobId,
      payload: { scheduledApiKeyFingerprint: rotatedFingerprint },
    });
  });

  it('splits each target into batches at Twenty’s 200-job limit', async () => {
    vi.mocked(listConnections).mockResolvedValue(
      Array.from({ length: 201 }, (_, index) => ({
        ...OWN_CONNECTION,
        id: `connection-${index}`,
      })),
    );

    await expect(granolaPersonalDailyCatchUpHandler()).resolves.toMatchObject({
      enqueuedConnectionCount: 201,
    });

    const requests = vi
      .mocked(enqueueJobs)
      .mock.calls.map(([request]) => request);
    for (const target of [
      GRANOLA_PERSONAL_CATCH_UP_WORKER_UNIVERSAL_IDENTIFIER,
      GRANOLA_PERSONAL_RECONCILE_UNIVERSAL_IDENTIFIER,
    ]) {
      const batches = requests.filter(
        ({ logicFunctionUniversalIdentifier }) =>
          logicFunctionUniversalIdentifier === target,
      );
      expect(batches.map(({ jobs }) => jobs?.length)).toEqual([200, 1]);
      expect(
        new Set(batches.flatMap(({ jobs }) => jobs?.map(({ jobId }) => jobId)))
          .size,
      ).toBe(201);
    }
  });
});
