import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { cancelWorkspaceRecallBotsOrThrow } from 'src/logic-functions/flows/cancel-workspace-recall-bots.util';

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

describe('cancelWorkspaceRecallBotsOrThrow', () => {
  const fetchMock = vi.fn();

  const buildJsonResponse = (status: number) => ({
    ok: status < 400,
    status,
    json: async () => ({}),
  });

  const stubRecallApi = ({
    bots,
    cancelStatusByBotId = {},
    ejectStatusByBotId = {},
    listStatus = 200,
    nextPageUrl = null,
  }: {
    bots: unknown[];
    cancelStatusByBotId?: Record<string, number>;
    ejectStatusByBotId?: Record<string, number>;
    listStatus?: number;
    nextPageUrl?: string | null;
  }) => {
    fetchMock.mockImplementation(
      async (url: string, requestInitialization: RequestInit) => {
        if (requestInitialization.method === 'DELETE') {
          const pathSegments = new URL(url).pathname.split('/');
          const botId = pathSegments[pathSegments.length - 2] ?? '';

          return buildJsonResponse(cancelStatusByBotId[botId] ?? 204);
        }

        if (requestInitialization.method === 'POST') {
          const [botId = ''] = new URL(url).pathname.split('/').slice(-3);

          return buildJsonResponse(ejectStatusByBotId[botId] ?? 200);
        }

        if (listStatus >= 400) {
          return buildJsonResponse(listStatus);
        }

        return {
          ok: true,
          status: 200,
          json: async () => ({ next: nextPageUrl, results: bots }),
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

    const workspaceRecallBotCleanupResult =
      await cancelWorkspaceRecallBotsOrThrow({
        knownExternalBotIds: ['known-bot'],
        joinAtAfter: JOIN_AT_AFTER,
        cancellationCutoffEpochMs: CANCELLATION_CUTOFF_EPOCH_MS,
      });

    expect(workspaceRecallBotCleanupResult).toEqual({
      scannedBotCount: 1,
      canceledExternalBotIds: ['known-bot', 'orphan-bot'],
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
    expect(listRequestParameters.getAll('status')).toEqual([]);
  });

  it('cancels upcoming bots that have no status yet', async () => {
    stubRecallApi({
      bots: [
        buildBot({
          id: 'not-ready-bot',
          twentyWorkspaceId: CURRENT_WORKSPACE_ID,
        }),
      ],
    });

    const workspaceRecallBotCleanupResult =
      await cancelWorkspaceRecallBotsOrThrow({
        knownExternalBotIds: [],
        joinAtAfter: JOIN_AT_AFTER,
        cancellationCutoffEpochMs: CANCELLATION_CUTOFF_EPOCH_MS,
      });

    const [listRequestUrl] = getCallsByMethod('GET')[0];
    expect(new URL(listRequestUrl).searchParams.has('status')).toBe(false);
    expect(workspaceRecallBotCleanupResult.canceledExternalBotIds).toEqual([
      'not-ready-bot',
    ]);
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

    const workspaceRecallBotCleanupPromise = cancelWorkspaceRecallBotsOrThrow({
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

    const workspaceRecallBotCleanupResult =
      await cancelWorkspaceRecallBotsOrThrow({
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

    const workspaceRecallBotCleanupResult =
      await cancelWorkspaceRecallBotsOrThrow({
        knownExternalBotIds: [],
        joinAtAfter: JOIN_AT_AFTER,
        cancellationCutoffEpochMs: CANCELLATION_CUTOFF_EPOCH_MS,
      });

    expect(workspaceRecallBotCleanupResult.scannedBotCount).toBe(2);
    expect(workspaceRecallBotCleanupResult.canceledExternalBotIds).toEqual([]);
    expect(getCallsByMethod('DELETE')).toHaveLength(0);
  });

  it('ejects a known bot that Recall refuses to delete because it already joined', async () => {
    stubRecallApi({ bots: [], cancelStatusByBotId: { 'joined-bot': 405 } });

    const workspaceRecallBotCleanupResult =
      await cancelWorkspaceRecallBotsOrThrow({
        knownExternalBotIds: ['joined-bot'],
        joinAtAfter: JOIN_AT_AFTER,
        cancellationCutoffEpochMs: CANCELLATION_CUTOFF_EPOCH_MS,
      });

    expect(workspaceRecallBotCleanupResult.canceledExternalBotIds).toEqual([
      'joined-bot',
    ]);
    const ejectRequests = getCallsByMethod('POST');
    expect(ejectRequests).toHaveLength(1);
    expect(new URL(ejectRequests[0][0]).pathname).toBe(
      '/api/v1/bot/joined-bot/leave_call/',
    );
  });

  it('does not fail for a bot in a call that it could not eject, since the call ends on its own', async () => {
    stubRecallApi({
      bots: [],
      cancelStatusByBotId: { 'joined-bot': 405 },
      ejectStatusByBotId: { 'joined-bot': 400 },
    });

    const workspaceRecallBotCleanupResult =
      await cancelWorkspaceRecallBotsOrThrow({
        knownExternalBotIds: ['joined-bot'],
        joinAtAfter: JOIN_AT_AFTER,
        cancellationCutoffEpochMs: CANCELLATION_CUTOFF_EPOCH_MS,
      });

    expect(workspaceRecallBotCleanupResult.canceledExternalBotIds).toEqual([]);
    expect(getCallsByMethod('DELETE')).toHaveLength(1);
    expect(getCallsByMethod('POST')).toHaveLength(1);
  });

  it('fails without re-attempting an upcoming bot it could not cancel', async () => {
    stubRecallApi({
      bots: [
        buildBot({
          id: 'failing-bot',
          twentyWorkspaceId: CURRENT_WORKSPACE_ID,
        }),
      ],
      cancelStatusByBotId: { 'failing-bot': 400 },
      ejectStatusByBotId: { 'failing-bot': 400 },
    });

    await expect(
      cancelWorkspaceRecallBotsOrThrow({
        knownExternalBotIds: ['failing-bot'],
        joinAtAfter: JOIN_AT_AFTER,
        cancellationCutoffEpochMs: CANCELLATION_CUTOFF_EPOCH_MS,
      }),
    ).rejects.toThrow('upcoming Recall bots are left (0 canceled, 1 failed)');
    expect(getCallsByMethod('DELETE')).toHaveLength(1);
    expect(getCallsByMethod('GET')).toHaveLength(1);
  });

  it('keeps direct cancellations and fails when the safety list fails', async () => {
    stubRecallApi({ bots: [], listStatus: 400 });

    await expect(
      cancelWorkspaceRecallBotsOrThrow({
        knownExternalBotIds: ['known-bot'],
        joinAtAfter: JOIN_AT_AFTER,
        cancellationCutoffEpochMs: CANCELLATION_CUTOFF_EPOCH_MS,
      }),
    ).rejects.toThrow(
      /failed to list Recall bots: .* \(1 canceled, 0 failed\)/,
    );
    expect(getCallsByMethod('DELETE')).toHaveLength(1);
  });

  it('fails when the safety list is truncated', async () => {
    stubRecallApi({
      bots: [],
      nextPageUrl: 'https://us-east-1.recall.ai/api/v1/bot/?cursor=next-page',
    });

    await expect(
      cancelWorkspaceRecallBotsOrThrow({
        knownExternalBotIds: [],
        joinAtAfter: JOIN_AT_AFTER,
        cancellationCutoffEpochMs: CANCELLATION_CUTOFF_EPOCH_MS,
      }),
    ).rejects.toThrow('Recall safety scan was truncated');
  });

  it('does not start listing within the time reserved for cancellations', async () => {
    stubRecallApi({
      bots: [
        buildBot({ id: 'orphan-bot', twentyWorkspaceId: CURRENT_WORKSPACE_ID }),
      ],
    });

    await expect(
      cancelWorkspaceRecallBotsOrThrow({
        knownExternalBotIds: [],
        joinAtAfter: JOIN_AT_AFTER,
        cancellationCutoffEpochMs: Date.now() + 1_000,
      }),
    ).rejects.toThrow('Recall safety scan was truncated');
    expect(getCallsByMethod('GET')).toHaveLength(0);
  });

  it('stops starting Recall calls at the cancellation cutoff', async () => {
    stubRecallApi({ bots: [] });
    vi.spyOn(Date, 'now').mockReturnValueOnce(0).mockReturnValueOnce(1);
    const knownExternalBotIds = Array.from(
      { length: 6 },
      (_, index) => `known-bot-${index + 1}`,
    );

    await expect(
      cancelWorkspaceRecallBotsOrThrow({
        knownExternalBotIds,
        joinAtAfter: JOIN_AT_AFTER,
        cancellationCutoffEpochMs: 1,
      }),
    ).rejects.toThrow(
      'cancellation cutoff reached before Recall safety scan (5 canceled, 0 failed)',
    );
    expect(getCallsByMethod('DELETE')).toHaveLength(5);
    expect(getCallsByMethod('GET')).toHaveLength(0);
  });

  it('cancels known bots then fails when the workspace id is unavailable', async () => {
    delete process.env.TWENTY_APP_ACCESS_TOKEN;
    stubRecallApi({ bots: [] });

    await expect(
      cancelWorkspaceRecallBotsOrThrow({
        knownExternalBotIds: ['known-bot'],
        joinAtAfter: JOIN_AT_AFTER,
        cancellationCutoffEpochMs: CANCELLATION_CUTOFF_EPOCH_MS,
      }),
    ).rejects.toThrow(
      'workspace id unavailable for Recall safety scan (1 canceled, 0 failed)',
    );
    expect(getCallsByMethod('DELETE')).toHaveLength(1);
    expect(getCallsByMethod('GET')).toHaveLength(0);
  });
});
