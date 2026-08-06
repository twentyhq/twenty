import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { cancelWorkspaceRecallBots } from 'src/logic-functions/flows/cancel-workspace-recall-bots.util';

const JOIN_AT_AFTER = '2026-01-01T08:00:00.000Z';
const CURRENT_WORKSPACE_ID = '123e4567-e89b-12d3-a456-426614174000';
const OTHER_WORKSPACE_ID = '123e4567-e89b-12d3-a456-426614174999';
const BASE_URL = 'https://us-east-1.recall.ai/api/v1';
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
        const botId = new URL(url).pathname.split('/').at(-2) ?? '';

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

  it('cancels every bot of the current workspace, claimed or not', async () => {
    stubRecallApi({
      bots: [
        buildBot({ id: 'bot-1', twentyWorkspaceId: CURRENT_WORKSPACE_ID }),
        buildBot({ id: 'bot-2', twentyWorkspaceId: CURRENT_WORKSPACE_ID }),
      ],
    });

    const result = await cancelWorkspaceRecallBots({
      joinAtAfter: JOIN_AT_AFTER,
    });

    expect(result).toEqual({
      scannedBotCount: 2,
      canceledExternalBotIds: ['bot-1', 'bot-2'],
      failedExternalBotIds: [],
      truncatedBotList: false,
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

    await cancelWorkspaceRecallBots({ joinAtAfter: JOIN_AT_AFTER });

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
    });

    expect(result).toEqual({
      scannedBotCount: 2,
      canceledExternalBotIds: [],
      failedExternalBotIds: [],
      truncatedBotList: false,
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
      cancelStatusByBotId: { 'failing-bot': 500 },
    });

    const result = await cancelWorkspaceRecallBots({
      joinAtAfter: JOIN_AT_AFTER,
    });

    expect(result.canceledExternalBotIds).toEqual(['healthy-bot']);
    expect(result.failedExternalBotIds).toEqual(['failing-bot']);
  });

  it('returns an empty result when listing bots fails', async () => {
    stubRecallApi({ bots: [], listStatus: 500 });

    const result = await cancelWorkspaceRecallBots({
      joinAtAfter: JOIN_AT_AFTER,
    });

    expect(result).toEqual({
      scannedBotCount: 0,
      canceledExternalBotIds: [],
      failedExternalBotIds: [],
      truncatedBotList: false,
    });
    expect(getDeleteCalls()).toHaveLength(0);
  });

  it('returns an empty result when the workspace id is unavailable', async () => {
    delete process.env.TWENTY_APP_ACCESS_TOKEN;
    stubRecallApi({ bots: [] });

    const result = await cancelWorkspaceRecallBots({
      joinAtAfter: JOIN_AT_AFTER,
    });

    expect(result).toEqual({
      scannedBotCount: 0,
      canceledExternalBotIds: [],
      failedExternalBotIds: [],
      truncatedBotList: false,
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
