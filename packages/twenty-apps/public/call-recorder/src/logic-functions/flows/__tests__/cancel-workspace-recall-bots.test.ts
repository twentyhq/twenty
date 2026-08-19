import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { cancelWorkspaceRecallBots } from 'src/logic-functions/flows/cancel-workspace-recall-bots.util';

const JOIN_AT_AFTER = '2026-01-01T08:00:00.000Z';
const CURRENT_WORKSPACE_ID = '123e4567-e89b-12d3-a456-426614174000';
const OTHER_WORKSPACE_ID = '123e4567-e89b-12d3-a456-426614174999';
const BASE_URL = 'https://us-east-1.recall.ai/api/v1';
const FAR_FUTURE_DEADLINE_EPOCH_MS = Number.MAX_SAFE_INTEGER;
const ENV_VAR_NAMES = [
  'RECALL_API_KEY',
  'RECALL_REGION',
  'TWENTY_APP_ACCESS_TOKEN',
] as const;
const ORIGINAL_ENV_VALUES = ENV_VAR_NAMES.map(
  (envVarName) => [envVarName, process.env[envVarName]] as const,
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
    fetchMock.mockImplementation(async (url: string, init: RequestInit) => {
      if (init.method === 'DELETE') {
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
    });
  };

  // Serves one claimed bot per page so a backlog above the 10-page list cap
  // yields a truncated pass; canceled bots leave subsequent list responses.
  const stubPagedRecallApi = ({
    claimedBotIds,
    cancelFailuresByBotId = {},
  }: {
    claimedBotIds: string[];
    cancelFailuresByBotId?: Record<string, number>;
  }) => {
    const canceledBotIds = new Set<string>();
    const remainingCancelFailures = { ...cancelFailuresByBotId };

    fetchMock.mockImplementation(async (url: string, init: RequestInit) => {
      if (init.method === 'DELETE') {
        const pathSegments = new URL(url).pathname.split('/');
        const botId = pathSegments[pathSegments.length - 2] ?? '';
        const failuresLeft = remainingCancelFailures[botId] ?? 0;

        if (failuresLeft > 0) {
          remainingCancelFailures[botId] = failuresLeft - 1;

          return buildJsonResponse(400);
        }

        canceledBotIds.add(botId);

        return buildJsonResponse(204);
      }

      const remainingBotIds = claimedBotIds.filter(
        (botId) => !canceledBotIds.has(botId),
      );
      const pageNumber = Number(new URL(url).searchParams.get('page') ?? '1');
      const pageBotId = remainingBotIds[pageNumber - 1];
      const nextPageUrl =
        pageNumber < remainingBotIds.length
          ? `${BASE_URL}/bot/?page=${pageNumber + 1}`
          : null;

      return {
        ok: true,
        status: 200,
        json: async () => ({
          next: nextPageUrl,
          results:
            pageBotId === undefined
              ? []
              : [
                  buildBot({
                    id: pageBotId,
                    twentyWorkspaceId: CURRENT_WORKSPACE_ID,
                  }),
                ],
        }),
      };
    });
  };

  const getDeleteCalls = () =>
    fetchMock.mock.calls.filter(([, init]) => init.method === 'DELETE');

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
    ORIGINAL_ENV_VALUES.forEach(([envVarName, originalValue]) => {
      if (originalValue === undefined) {
        delete process.env[envVarName];
      } else {
        process.env[envVarName] = originalValue;
      }
    });
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('cancels every bot claimed by the current workspace', async () => {
    stubRecallApi({
      bots: [
        buildBot({ id: 'bot-1', twentyWorkspaceId: CURRENT_WORKSPACE_ID }),
        buildBot({ id: 'bot-2', twentyWorkspaceId: CURRENT_WORKSPACE_ID }),
      ],
    });

    const result = await cancelWorkspaceRecallBots({
      joinAtAfter: JOIN_AT_AFTER,
      deadlineEpochMs: FAR_FUTURE_DEADLINE_EPOCH_MS,
    });

    expect(result).toEqual({
      scannedBotCount: 2,
      canceledExternalBotIds: ['bot-1', 'bot-2'],
      failedExternalBotIds: [],
      truncatedBotList: false,
      deadlineReached: false,
    });
    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/bot/bot-1/`,
      expect.objectContaining({ method: 'DELETE' }),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/bot/bot-2/`,
      expect.objectContaining({ method: 'DELETE' }),
    );
  });

  it('lists bots with the workspace metadata filter and no upper join_at bound', async () => {
    stubRecallApi({ bots: [] });

    await cancelWorkspaceRecallBots({
      joinAtAfter: JOIN_AT_AFTER,
      deadlineEpochMs: FAR_FUTURE_DEADLINE_EPOCH_MS,
    });

    const [listRequestUrl] = fetchMock.mock.calls[0];
    const listRequestParameters = new URL(listRequestUrl).searchParams;
    expect(listRequestParameters.get('join_at_after')).toBe(JOIN_AT_AFTER);
    expect(listRequestParameters.get('join_at_before')).toBeNull();
    expect(listRequestParameters.get('metadata__twentyWorkspaceId')).toBe(
      CURRENT_WORKSPACE_ID,
    );
  });

  it('skips bots claimed by another workspace', async () => {
    stubRecallApi({
      bots: [
        buildBot({ id: 'other-bot', twentyWorkspaceId: OTHER_WORKSPACE_ID }),
        buildBot({ id: 'unclaimed-bot' }),
      ],
    });

    const result = await cancelWorkspaceRecallBots({
      joinAtAfter: JOIN_AT_AFTER,
      deadlineEpochMs: FAR_FUTURE_DEADLINE_EPOCH_MS,
    });

    expect(result).toEqual({
      scannedBotCount: 2,
      canceledExternalBotIds: [],
      failedExternalBotIds: [],
      truncatedBotList: false,
      deadlineReached: false,
    });
    expect(getDeleteCalls()).toHaveLength(0);
  });

  it('records already-dispatched bots as failed without ejecting them', async () => {
    stubRecallApi({
      bots: [
        buildBot({
          id: 'in-call-bot',
          twentyWorkspaceId: CURRENT_WORKSPACE_ID,
        }),
      ],
      cancelStatusByBotId: { 'in-call-bot': 405 },
    });

    const result = await cancelWorkspaceRecallBots({
      joinAtAfter: JOIN_AT_AFTER,
      deadlineEpochMs: FAR_FUTURE_DEADLINE_EPOCH_MS,
    });

    expect(result.canceledExternalBotIds).toEqual([]);
    expect(result.failedExternalBotIds).toEqual(['in-call-bot']);
    expect(
      fetchMock.mock.calls.filter(([, init]) => init.method === 'POST'),
    ).toHaveLength(0);
  });

  it('records failed cancellations and continues with remaining bots', async () => {
    stubRecallApi({
      bots: [
        buildBot({
          id: 'failing-bot',
          twentyWorkspaceId: CURRENT_WORKSPACE_ID,
        }),
        buildBot({
          id: 'healthy-bot',
          twentyWorkspaceId: CURRENT_WORKSPACE_ID,
        }),
      ],
      cancelStatusByBotId: { 'failing-bot': 400 },
    });

    const result = await cancelWorkspaceRecallBots({
      joinAtAfter: JOIN_AT_AFTER,
      deadlineEpochMs: FAR_FUTURE_DEADLINE_EPOCH_MS,
    });

    expect(result.canceledExternalBotIds).toEqual(['healthy-bot']);
    expect(result.failedExternalBotIds).toEqual(['failing-bot']);
  });

  it('returns an empty result when listing bots fails', async () => {
    stubRecallApi({ bots: [], listStatus: 400 });

    const result = await cancelWorkspaceRecallBots({
      joinAtAfter: JOIN_AT_AFTER,
      deadlineEpochMs: FAR_FUTURE_DEADLINE_EPOCH_MS,
    });

    expect(result).toEqual({
      scannedBotCount: 0,
      canceledExternalBotIds: [],
      failedExternalBotIds: [],
      truncatedBotList: false,
      deadlineReached: false,
    });
    expect(getDeleteCalls()).toHaveLength(0);
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('uninstall bot cleanup incomplete'),
    );
  });

  it('drains a truncated backlog by re-listing until nothing remains', async () => {
    const claimedBotIds = Array.from(
      { length: 11 },
      (_, index) => `bot-${index + 1}`,
    );
    stubPagedRecallApi({ claimedBotIds });

    const result = await cancelWorkspaceRecallBots({
      joinAtAfter: JOIN_AT_AFTER,
      deadlineEpochMs: FAR_FUTURE_DEADLINE_EPOCH_MS,
    });

    expect(result.canceledExternalBotIds).toEqual(claimedBotIds);
    expect(result.failedExternalBotIds).toEqual([]);
    expect(result.truncatedBotList).toBe(false);
    expect(getDeleteCalls()).toHaveLength(11);
  });

  it('stops draining when a truncated pass cancels nothing', async () => {
    const claimedBotIds = Array.from(
      { length: 11 },
      (_, index) => `bot-${index + 1}`,
    );
    stubPagedRecallApi({
      claimedBotIds,
      cancelFailuresByBotId: Object.fromEntries(
        claimedBotIds.map((botId) => [botId, 1]),
      ),
    });

    const result = await cancelWorkspaceRecallBots({
      joinAtAfter: JOIN_AT_AFTER,
      deadlineEpochMs: FAR_FUTURE_DEADLINE_EPOCH_MS,
    });

    expect(result.canceledExternalBotIds).toEqual([]);
    expect(result.failedExternalBotIds).toHaveLength(10);
    expect(result.truncatedBotList).toBe(true);
    expect(getDeleteCalls()).toHaveLength(10);
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('bot list remains truncated'),
    );
  });

  it('does not retry a failed cancellation while draining later pages', async () => {
    const claimedBotIds = Array.from(
      { length: 11 },
      (_, index) => `bot-${index + 1}`,
    );
    stubPagedRecallApi({
      claimedBotIds,
      cancelFailuresByBotId: { 'bot-1': 1 },
    });

    const result = await cancelWorkspaceRecallBots({
      joinAtAfter: JOIN_AT_AFTER,
      deadlineEpochMs: FAR_FUTURE_DEADLINE_EPOCH_MS,
    });

    expect(result.canceledExternalBotIds).toHaveLength(10);
    expect(result.canceledExternalBotIds).not.toContain('bot-1');
    expect(result.failedExternalBotIds).toEqual(['bot-1']);
    expect(
      getDeleteCalls().filter(
        ([url]) => new URL(url).pathname === '/api/v1/bot/bot-1/',
      ),
    ).toHaveLength(1);
  });

  it('skips listing and cancellations once the deadline has passed', async () => {
    stubRecallApi({
      bots: [
        buildBot({ id: 'bot-1', twentyWorkspaceId: CURRENT_WORKSPACE_ID }),
      ],
    });

    const result = await cancelWorkspaceRecallBots({
      joinAtAfter: JOIN_AT_AFTER,
      deadlineEpochMs: 0,
    });

    expect(result.deadlineReached).toBe(true);
    expect(result.canceledExternalBotIds).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('cancellation deadline reached'),
    );
  });

  it('does not re-list after cancellations reach the deadline', async () => {
    const claimedBotIds = Array.from(
      { length: 11 },
      (_, index) => `bot-${index + 1}`,
    );
    stubPagedRecallApi({ claimedBotIds });
    vi.spyOn(Date, 'now').mockImplementation(() =>
      getDeleteCalls().length >= 10 ? 1 : 0,
    );

    const result = await cancelWorkspaceRecallBots({
      joinAtAfter: JOIN_AT_AFTER,
      deadlineEpochMs: 1,
    });

    const listCalls = fetchMock.mock.calls.filter(
      ([, init]) => init.method === 'GET',
    );

    expect(result.deadlineReached).toBe(true);
    expect(result.canceledExternalBotIds).toHaveLength(10);
    expect(listCalls).toHaveLength(10);
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('cancellation deadline reached'),
    );
  });

  it('returns an empty result when the workspace id is unavailable', async () => {
    delete process.env.TWENTY_APP_ACCESS_TOKEN;
    stubRecallApi({ bots: [] });

    const result = await cancelWorkspaceRecallBots({
      joinAtAfter: JOIN_AT_AFTER,
      deadlineEpochMs: FAR_FUTURE_DEADLINE_EPOCH_MS,
    });

    expect(result).toEqual({
      scannedBotCount: 0,
      canceledExternalBotIds: [],
      failedExternalBotIds: [],
      truncatedBotList: false,
      deadlineReached: false,
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
