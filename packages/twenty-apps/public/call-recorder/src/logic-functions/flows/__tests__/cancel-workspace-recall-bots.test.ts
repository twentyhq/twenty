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
    next = null,
  }: {
    bots: unknown[];
    cancelStatusByBotId?: Record<string, number>;
    listStatus?: number;
    next?: string | null;
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
          json: async () => ({ next, results: bots }),
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

  it('cancels every upcoming workspace bot, whatever its status', async () => {
    stubRecallApi({
      bots: [
        buildBot({
          id: 'unstarted-bot',
          twentyWorkspaceId: CURRENT_WORKSPACE_ID,
        }),
        buildBot({ id: 'ready-bot', twentyWorkspaceId: CURRENT_WORKSPACE_ID }),
      ],
    });

    const workspaceRecallBotCleanupResult = await cancelWorkspaceRecallBots({
      joinAtAfter: JOIN_AT_AFTER,
      cancellationCutoffEpochMs: CANCELLATION_CUTOFF_EPOCH_MS,
    });

    expect(workspaceRecallBotCleanupResult).toEqual({
      scannedBotCount: 2,
      canceledExternalBotIds: ['unstarted-bot', 'ready-bot'],
    });
    const [listRequestUrl] = getCallsByMethod('GET')[0];
    const listRequestParameters = new URL(listRequestUrl).searchParams;
    expect(listRequestParameters.get('join_at_after')).toBe(JOIN_AT_AFTER);
    expect(listRequestParameters.get('join_at_before')).toBeNull();
    expect(listRequestParameters.get('metadata__twentyWorkspaceId')).toBe(
      CURRENT_WORKSPACE_ID,
    );
    expect(listRequestParameters.getAll('status')).toEqual([]);
  });

  it('cancels bots five at a time', async () => {
    let releaseRecallBotCancellations: () => void = () => {};
    const recallBotCancellationsReleased = new Promise<void>((resolve) => {
      releaseRecallBotCancellations = resolve;
    });
    const externalBotIds = Array.from(
      { length: 6 },
      (_, index) => `bot-${index + 1}`,
    );
    fetchMock.mockImplementation(
      async (_url: string, requestInitialization: RequestInit) => {
        if (requestInitialization.method === 'DELETE') {
          await recallBotCancellationsReleased;

          return buildJsonResponse(204);
        }

        return {
          ok: true,
          status: 200,
          json: async () => ({
            next: null,
            results: externalBotIds.map((id) =>
              buildBot({ id, twentyWorkspaceId: CURRENT_WORKSPACE_ID }),
            ),
          }),
        };
      },
    );

    const workspaceRecallBotCleanupPromise = cancelWorkspaceRecallBots({
      joinAtAfter: JOIN_AT_AFTER,
      cancellationCutoffEpochMs: CANCELLATION_CUTOFF_EPOCH_MS,
    });

    await vi.waitFor(() => expect(getCallsByMethod('DELETE')).toHaveLength(5));
    releaseRecallBotCancellations();
    const workspaceRecallBotCleanupResult =
      await workspaceRecallBotCleanupPromise;

    expect(getCallsByMethod('DELETE')).toHaveLength(6);
    expect(workspaceRecallBotCleanupResult.canceledExternalBotIds).toEqual(
      externalBotIds,
    );
  });

  it('skips listed bots that are not claimed by the current workspace', async () => {
    stubRecallApi({
      bots: [
        buildBot({ id: 'other-bot', twentyWorkspaceId: OTHER_WORKSPACE_ID }),
        buildBot({ id: 'unclaimed-bot' }),
      ],
    });

    const workspaceRecallBotCleanupResult = await cancelWorkspaceRecallBots({
      joinAtAfter: JOIN_AT_AFTER,
      cancellationCutoffEpochMs: CANCELLATION_CUTOFF_EPOCH_MS,
    });

    expect(workspaceRecallBotCleanupResult.scannedBotCount).toBe(2);
    expect(workspaceRecallBotCleanupResult.canceledExternalBotIds).toEqual([]);
    expect(getCallsByMethod('DELETE')).toHaveLength(0);
  });

  it('treats a bot that already started joining as settled', async () => {
    stubRecallApi({
      bots: [
        buildBot({
          id: 'joining-bot',
          twentyWorkspaceId: CURRENT_WORKSPACE_ID,
        }),
      ],
      cancelStatusByBotId: { 'joining-bot': 405 },
    });

    const workspaceRecallBotCleanupResult = await cancelWorkspaceRecallBots({
      joinAtAfter: JOIN_AT_AFTER,
      cancellationCutoffEpochMs: CANCELLATION_CUTOFF_EPOCH_MS,
    });

    expect(workspaceRecallBotCleanupResult.canceledExternalBotIds).toEqual([]);
    expect(getCallsByMethod('DELETE')).toHaveLength(1);
  });

  it('fails once a bot still cannot be canceled after three attempts', async () => {
    vi.useFakeTimers();
    stubRecallApi({
      bots: [
        buildBot({ id: 'stuck-bot', twentyWorkspaceId: CURRENT_WORKSPACE_ID }),
      ],
      cancelStatusByBotId: { 'stuck-bot': 409 },
    });

    const workspaceRecallBotCleanupExpectation = expect(
      cancelWorkspaceRecallBots({
        joinAtAfter: JOIN_AT_AFTER,
        cancellationCutoffEpochMs: CANCELLATION_CUTOFF_EPOCH_MS,
      }),
    ).rejects.toThrow('0 canceled, 1 failed');

    await vi.runAllTimersAsync();
    await workspaceRecallBotCleanupExpectation;

    expect(getCallsByMethod('DELETE')).toHaveLength(3);
  });

  it('fails without canceling anything when the Recall list fails', async () => {
    stubRecallApi({ bots: [], listStatus: 400 });

    await expect(
      cancelWorkspaceRecallBots({
        joinAtAfter: JOIN_AT_AFTER,
        cancellationCutoffEpochMs: CANCELLATION_CUTOFF_EPOCH_MS,
      }),
    ).rejects.toThrow('failed to list Recall bots');
    expect(getCallsByMethod('DELETE')).toHaveLength(0);
  });

  it('fails when the Recall list is truncated', async () => {
    stubRecallApi({
      bots: [],
      next: 'https://us-east-1.recall.ai/api/v1/bot/?cursor=next-page',
    });

    await expect(
      cancelWorkspaceRecallBots({
        joinAtAfter: JOIN_AT_AFTER,
        cancellationCutoffEpochMs: CANCELLATION_CUTOFF_EPOCH_MS,
      }),
    ).rejects.toThrow('list truncated: true');
  });

  it('fails at the cutoff and a retry finishes the bots that are left', async () => {
    const remainingBots = new Map(
      Array.from({ length: 7 }, (_, index) => {
        const id = `bot-${index + 1}`;

        return [id, buildBot({ id, twentyWorkspaceId: CURRENT_WORKSPACE_ID })];
      }),
    );
    fetchMock.mockImplementation(
      async (url: string, requestInitialization: RequestInit) => {
        if (requestInitialization.method === 'DELETE') {
          const pathSegments = new URL(url).pathname.split('/');

          remainingBots.delete(pathSegments[pathSegments.length - 2] ?? '');

          return buildJsonResponse(204);
        }

        return {
          ok: true,
          status: 200,
          json: async () => ({
            next: null,
            results: [...remainingBots.values()],
          }),
        };
      },
    );
    vi.spyOn(Date, 'now')
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(1);

    await expect(
      cancelWorkspaceRecallBots({
        joinAtAfter: JOIN_AT_AFTER,
        cancellationCutoffEpochMs: 1,
      }),
    ).rejects.toThrow('5 canceled, 0 failed, cutoff reached: true');
    expect(remainingBots.size).toBe(2);

    const retryResult = await cancelWorkspaceRecallBots({
      joinAtAfter: JOIN_AT_AFTER,
      cancellationCutoffEpochMs: CANCELLATION_CUTOFF_EPOCH_MS,
    });

    expect(retryResult.canceledExternalBotIds).toEqual(['bot-6', 'bot-7']);
    expect(remainingBots.size).toBe(0);
  });

  it('fails without calling Recall when the workspace id is unavailable', async () => {
    delete process.env.TWENTY_APP_ACCESS_TOKEN;
    stubRecallApi({ bots: [] });

    await expect(
      cancelWorkspaceRecallBots({
        joinAtAfter: JOIN_AT_AFTER,
        cancellationCutoffEpochMs: CANCELLATION_CUTOFF_EPOCH_MS,
      }),
    ).rejects.toThrow('workspace id unavailable');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
