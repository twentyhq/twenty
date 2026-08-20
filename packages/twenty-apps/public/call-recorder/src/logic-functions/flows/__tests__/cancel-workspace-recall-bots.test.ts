import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { cancelWorkspaceRecallBots } from 'src/logic-functions/flows/cancel-workspace-recall-bots.util';

const JOIN_AT_AFTER = '2025-12-31T07:00:00.000Z';
const CANCELLATION_CUTOFF_EPOCH_MS = Number.MAX_SAFE_INTEGER;
const CURRENT_WORKSPACE_ID = '123e4567-e89b-12d3-a456-426614174000';
const OTHER_WORKSPACE_ID = '123e4567-e89b-12d3-a456-426614174999';
const ENVIRONMENT_VARIABLE_NAMES = [
  'RECALL_API_KEY',
  'RECALL_REGION',
  'TWENTY_APP_ACCESS_TOKEN',
] as const;
const ORIGINAL_ENVIRONMENT_VALUES = ENVIRONMENT_VARIABLE_NAMES.map(
  (environmentVariableName) =>
    [environmentVariableName, process.env[environmentVariableName]] as const,
);

const buildAccessToken = (payload: Record<string, unknown>): string =>
  [
    Buffer.from(JSON.stringify({ alg: 'none' })).toString('base64url'),
    Buffer.from(JSON.stringify(payload)).toString('base64url'),
    'signature',
  ].join('.');

const buildBot = ({
  id,
  twentyWorkspaceId,
}: {
  id: string;
  twentyWorkspaceId?: string;
}) => ({
  id,
  metadata: twentyWorkspaceId === undefined ? {} : { twentyWorkspaceId },
});

describe('cancelWorkspaceRecallBots', () => {
  const fetchMock = vi.fn();

  const buildJsonResponse = (status: number) => ({
    ok: status < 400,
    status,
    json: async () => ({}),
  });

  const stubRecallApi = ({
    bots,
    cancelStatusByBotId = {},
    listStatus = 200,
  }: {
    bots: unknown[];
    cancelStatusByBotId?: Record<string, number>;
    listStatus?: number;
  }) => {
    fetchMock.mockImplementation(
      async (url: string, requestInitialization: RequestInit) => {
        if (requestInitialization.method === 'DELETE') {
          const pathSegments = new URL(url).pathname.split('/');
          const botId = pathSegments[pathSegments.length - 2] ?? '';

          return buildJsonResponse(cancelStatusByBotId[botId] ?? 204);
        }

        if (listStatus >= 400) {
          return buildJsonResponse(listStatus);
        }

        return {
          ok: true,
          status: 200,
          json: async () => ({ next: null, results: bots }),
        };
      },
    );
  };

  const getCallsByMethod = (method: string) =>
    fetchMock.mock.calls.filter(
      ([, requestInitialization]) => requestInitialization.method === method,
    );

  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    process.env.RECALL_API_KEY = 'recall-api-key';
    process.env.RECALL_REGION = 'us-east-1';
    process.env.TWENTY_APP_ACCESS_TOKEN = buildAccessToken({
      workspaceId: CURRENT_WORKSPACE_ID,
    });
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    ORIGINAL_ENVIRONMENT_VALUES.forEach(
      ([environmentVariableName, originalValue]) => {
        if (originalValue === undefined) {
          delete process.env[environmentVariableName];
        } else {
          process.env[environmentVariableName] = originalValue;
        }
      },
    );
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('cancels known record bot ids before one workspace-filtered list pass', async () => {
    stubRecallApi({
      bots: [
        buildBot({ id: 'orphan-bot', twentyWorkspaceId: CURRENT_WORKSPACE_ID }),
      ],
    });

    const workspaceRecallBotCleanupResult = await cancelWorkspaceRecallBots({
      knownExternalBotIds: ['known-bot'],
      joinAtAfter: JOIN_AT_AFTER,
      cancellationCutoffEpochMs: CANCELLATION_CUTOFF_EPOCH_MS,
    });

    expect(workspaceRecallBotCleanupResult).toEqual({
      scannedBotCount: 1,
      canceledExternalBotIds: ['known-bot', 'orphan-bot'],
      failedExternalBotIds: [],
      truncatedBotList: false,
      cutoffReached: false,
    });
    expect(
      fetchMock.mock.calls.map(
        ([, requestInitialization]) => requestInitialization.method,
      ),
    ).toEqual(['DELETE', 'GET', 'DELETE']);
    const [listRequestUrl] = getCallsByMethod('GET')[0];
    const listRequestParameters = new URL(listRequestUrl).searchParams;
    expect(listRequestParameters.get('join_at_after')).toBe(JOIN_AT_AFTER);
    expect(listRequestParameters.get('join_at_before')).toBeNull();
    expect(listRequestParameters.get('metadata__twentyWorkspaceId')).toBe(
      CURRENT_WORKSPACE_ID,
    );
    expect(listRequestParameters.getAll('status')).toEqual(['ready']);
  });

  it('cancels known bots five at a time', async () => {
    let releaseRecallBotCancellations: () => void = () => {};
    const recallBotCancellationsReleased = new Promise<void>((resolve) => {
      releaseRecallBotCancellations = resolve;
    });
    fetchMock.mockImplementation(
      async (_url: string, requestInitialization: RequestInit) => {
        if (requestInitialization.method === 'DELETE') {
          await recallBotCancellationsReleased;

          return buildJsonResponse(204);
        }

        return {
          ok: true,
          status: 200,
          json: async () => ({ next: null, results: [] }),
        };
      },
    );
    const knownExternalBotIds = Array.from(
      { length: 6 },
      (_, index) => `known-bot-${index + 1}`,
    );

    const workspaceRecallBotCleanupPromise = cancelWorkspaceRecallBots({
      knownExternalBotIds,
      joinAtAfter: JOIN_AT_AFTER,
      cancellationCutoffEpochMs: CANCELLATION_CUTOFF_EPOCH_MS,
    });

    expect(getCallsByMethod('DELETE')).toHaveLength(5);
    releaseRecallBotCancellations();
    const workspaceRecallBotCleanupResult =
      await workspaceRecallBotCleanupPromise;

    expect(getCallsByMethod('DELETE')).toHaveLength(6);
    expect(workspaceRecallBotCleanupResult.canceledExternalBotIds).toEqual(
      knownExternalBotIds,
    );
  });

  it('does not cancel a known bot twice when the safety list also returns it', async () => {
    stubRecallApi({
      bots: [
        buildBot({ id: 'known-bot', twentyWorkspaceId: CURRENT_WORKSPACE_ID }),
      ],
    });

    const workspaceRecallBotCleanupResult = await cancelWorkspaceRecallBots({
      knownExternalBotIds: ['known-bot', 'known-bot'],
      joinAtAfter: JOIN_AT_AFTER,
      cancellationCutoffEpochMs: CANCELLATION_CUTOFF_EPOCH_MS,
    });

    expect(workspaceRecallBotCleanupResult.canceledExternalBotIds).toEqual([
      'known-bot',
    ]);
    expect(getCallsByMethod('DELETE')).toHaveLength(1);
    expect(getCallsByMethod('GET')).toHaveLength(1);
  });

  it('skips safety-list bots that are not claimed by the current workspace', async () => {
    stubRecallApi({
      bots: [
        buildBot({ id: 'other-bot', twentyWorkspaceId: OTHER_WORKSPACE_ID }),
        buildBot({ id: 'unclaimed-bot' }),
      ],
    });

    const workspaceRecallBotCleanupResult = await cancelWorkspaceRecallBots({
      knownExternalBotIds: [],
      joinAtAfter: JOIN_AT_AFTER,
      cancellationCutoffEpochMs: CANCELLATION_CUTOFF_EPOCH_MS,
    });

    expect(workspaceRecallBotCleanupResult.scannedBotCount).toBe(2);
    expect(workspaceRecallBotCleanupResult.canceledExternalBotIds).toEqual([]);
    expect(getCallsByMethod('DELETE')).toHaveLength(0);
  });

  it('exposes the three retry attempts made for a joined bot returning 409', async () => {
    vi.useFakeTimers();
    stubRecallApi({ bots: [], cancelStatusByBotId: { 'joined-bot': 409 } });

    const workspaceRecallBotCleanupPromise = cancelWorkspaceRecallBots({
      knownExternalBotIds: ['joined-bot'],
      joinAtAfter: JOIN_AT_AFTER,
      cancellationCutoffEpochMs: CANCELLATION_CUTOFF_EPOCH_MS,
    });

    await vi.runAllTimersAsync();
    const workspaceRecallBotCleanupResult =
      await workspaceRecallBotCleanupPromise;

    expect(workspaceRecallBotCleanupResult.failedExternalBotIds).toEqual([
      'joined-bot',
    ]);
    expect(getCallsByMethod('DELETE')).toHaveLength(3);
    expect(getCallsByMethod('POST')).toHaveLength(0);
  });

  it('does not re-attempt a failed known bot returned by the safety list', async () => {
    stubRecallApi({
      bots: [
        buildBot({
          id: 'failing-bot',
          twentyWorkspaceId: CURRENT_WORKSPACE_ID,
        }),
      ],
      cancelStatusByBotId: { 'failing-bot': 400 },
    });

    const workspaceRecallBotCleanupResult = await cancelWorkspaceRecallBots({
      knownExternalBotIds: ['failing-bot'],
      joinAtAfter: JOIN_AT_AFTER,
      cancellationCutoffEpochMs: CANCELLATION_CUTOFF_EPOCH_MS,
    });

    expect(workspaceRecallBotCleanupResult.failedExternalBotIds).toEqual([
      'failing-bot',
    ]);
    expect(getCallsByMethod('DELETE')).toHaveLength(1);
    expect(getCallsByMethod('GET')).toHaveLength(1);
  });

  it('keeps direct cancellations when the safety list fails', async () => {
    stubRecallApi({ bots: [], listStatus: 400 });

    const workspaceRecallBotCleanupResult = await cancelWorkspaceRecallBots({
      knownExternalBotIds: ['known-bot'],
      joinAtAfter: JOIN_AT_AFTER,
      cancellationCutoffEpochMs: CANCELLATION_CUTOFF_EPOCH_MS,
    });

    expect(workspaceRecallBotCleanupResult).toEqual({
      scannedBotCount: 0,
      canceledExternalBotIds: ['known-bot'],
      failedExternalBotIds: [],
      truncatedBotList: false,
      cutoffReached: false,
    });
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('failed to list Recall bots'),
    );
  });

  it('stops starting Recall calls at the cancellation cutoff', async () => {
    stubRecallApi({ bots: [] });
    vi.spyOn(Date, 'now').mockReturnValueOnce(0).mockReturnValueOnce(1);
    const knownExternalBotIds = Array.from(
      { length: 6 },
      (_, index) => `known-bot-${index + 1}`,
    );

    const workspaceRecallBotCleanupResult = await cancelWorkspaceRecallBots({
      knownExternalBotIds,
      joinAtAfter: JOIN_AT_AFTER,
      cancellationCutoffEpochMs: 1,
    });

    expect(workspaceRecallBotCleanupResult.canceledExternalBotIds).toEqual(
      knownExternalBotIds.slice(0, 5),
    );
    expect(workspaceRecallBotCleanupResult.cutoffReached).toBe(true);
    expect(getCallsByMethod('DELETE')).toHaveLength(5);
    expect(getCallsByMethod('GET')).toHaveLength(0);
  });

  it('cancels known bots even when the workspace id is unavailable', async () => {
    delete process.env.TWENTY_APP_ACCESS_TOKEN;
    stubRecallApi({ bots: [] });

    const workspaceRecallBotCleanupResult = await cancelWorkspaceRecallBots({
      knownExternalBotIds: ['known-bot'],
      joinAtAfter: JOIN_AT_AFTER,
      cancellationCutoffEpochMs: CANCELLATION_CUTOFF_EPOCH_MS,
    });

    expect(workspaceRecallBotCleanupResult.canceledExternalBotIds).toEqual([
      'known-bot',
    ]);
    expect(getCallsByMethod('DELETE')).toHaveLength(1);
    expect(getCallsByMethod('GET')).toHaveLength(0);
  });
});
