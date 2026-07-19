import { type CoreApiClient } from 'twenty-client-sdk/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { cleanupOrphanedRecallBots } from 'src/logic-functions/flows/cleanup-orphaned-recall-bots.util';

const JOIN_AT_AFTER = '2026-01-01T08:00:00.000Z';
const JOIN_AT_BEFORE = '2026-01-02T12:00:00.000Z';
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

type CallRecordingNode = {
  id: string;
  recordingRequestStatus?: string | null;
  externalBotId?: string | null;
};

class FakeCoreApiClient {
  constructor(private callRecordings: CallRecordingNode[]) {}

  async query(query: any): Promise<any> {
    const callRecordingIds = query.callRecordings.__args.filter.id.in;

    return {
      callRecordings: {
        pageInfo: { hasNextPage: false, endCursor: undefined },
        edges: this.callRecordings
          .filter((callRecording) =>
            callRecordingIds.includes(callRecording.id),
          )
          .map((node) => ({ node })),
      },
    };
  }
}

const buildClient = (callRecordings: CallRecordingNode[]): CoreApiClient =>
  new FakeCoreApiClient(callRecordings) as unknown as CoreApiClient;

const buildAccessToken = (payload: Record<string, unknown>): string =>
  [
    Buffer.from(JSON.stringify({ alg: 'none' })).toString('base64url'),
    Buffer.from(JSON.stringify(payload)).toString('base64url'),
    'signature',
  ].join('.');

const buildBot = ({
  id,
  twentyCallRecordingId,
  twentyWorkspaceId,
}: {
  id: string;
  twentyCallRecordingId?: string;
  twentyWorkspaceId?: string;
}) => ({
  id,
  metadata: {
    ...(twentyCallRecordingId === undefined ? {} : { twentyCallRecordingId }),
    ...(twentyWorkspaceId === undefined ? {} : { twentyWorkspaceId }),
  },
});

const buildCurrentWorkspaceBot = ({
  id,
  twentyCallRecordingId,
}: {
  id: string;
  twentyCallRecordingId: string;
}) =>
  buildBot({
    id,
    twentyCallRecordingId,
    twentyWorkspaceId: CURRENT_WORKSPACE_ID,
  });

describe('cleanupOrphanedRecallBots', () => {
  const fetchMock = vi.fn();

  const buildJsonResponse = (status: number) => ({
    ok: status < 400,
    status,
    json: async () => ({}),
  });

  const stubRecallApi = ({
    bots,
    cancelStatus = 204,
  }: {
    bots: unknown[];
    cancelStatus?: number;
  }) => {
    fetchMock.mockImplementation(async (_url: string, init: RequestInit) => {
      if (init.method === 'DELETE') {
        return buildJsonResponse(cancelStatus);
      }

      if (init.method === 'POST') {
        return buildJsonResponse(200);
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
    vi.useRealTimers();
  });

  it('keeps bots that their call recording still references', async () => {
    stubRecallApi({
      bots: [
        buildCurrentWorkspaceBot({
          id: 'claimed-bot',
          twentyCallRecordingId: 'call-recording-1',
        }),
      ],
    });

    const result = await cleanupOrphanedRecallBots({
      client: buildClient([
        {
          id: 'call-recording-1',
          recordingRequestStatus: 'REQUESTED',
          externalBotId: 'claimed-bot',
        },
      ]),
      joinAtAfter: JOIN_AT_AFTER,
      joinAtBefore: JOIN_AT_BEFORE,
    });

    expect(result).toEqual({
      scannedBotCount: 1,
      truncatedBotList: false,
      canceledExternalBotIds: [],
    });
    expect(getDeleteCalls()).toHaveLength(0);
  });

  it('lists only bots claimed by the current workspace', async () => {
    stubRecallApi({ bots: [] });

    await cleanupOrphanedRecallBots({
      client: buildClient([]),
      joinAtAfter: JOIN_AT_AFTER,
      joinAtBefore: JOIN_AT_BEFORE,
    });

    const [listRequestUrl] = fetchMock.mock.calls[0];
    const listRequestParameters = new URL(listRequestUrl).searchParams;
    expect(listRequestParameters.get('join_at_after')).toBe(JOIN_AT_AFTER);
    expect(listRequestParameters.get('join_at_before')).toBe(JOIN_AT_BEFORE);
    expect(listRequestParameters.get('metadata__twentyWorkspaceId')).toBe(
      CURRENT_WORKSPACE_ID,
    );
  });

  it('cancels bots whose call recording request was canceled locally', async () => {
    stubRecallApi({
      bots: [
        buildCurrentWorkspaceBot({
          id: 'stale-cancel-bot',
          twentyCallRecordingId: 'call-recording-1',
        }),
      ],
    });

    const result = await cleanupOrphanedRecallBots({
      client: buildClient([
        {
          id: 'call-recording-1',
          recordingRequestStatus: 'CANCELED',
          externalBotId: 'stale-cancel-bot',
        },
      ]),
      joinAtAfter: JOIN_AT_AFTER,
      joinAtBefore: JOIN_AT_BEFORE,
    });

    expect(result).toEqual({
      scannedBotCount: 1,
      truncatedBotList: false,
      canceledExternalBotIds: ['stale-cancel-bot'],
    });
    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/bot/stale-cancel-bot/`,
      expect.objectContaining({ method: 'DELETE' }),
    );
  });

  it('cancels bots whose call recording references another bot', async () => {
    stubRecallApi({
      bots: [
        buildCurrentWorkspaceBot({
          id: 'superseded-bot',
          twentyCallRecordingId: 'call-recording-1',
        }),
        buildCurrentWorkspaceBot({
          id: 'claimed-bot',
          twentyCallRecordingId: 'call-recording-1',
        }),
      ],
    });

    const result = await cleanupOrphanedRecallBots({
      client: buildClient([
        {
          id: 'call-recording-1',
          recordingRequestStatus: 'REQUESTED',
          externalBotId: 'claimed-bot',
        },
      ]),
      joinAtAfter: JOIN_AT_AFTER,
      joinAtBefore: JOIN_AT_BEFORE,
    });

    expect(result).toEqual({
      scannedBotCount: 2,
      truncatedBotList: false,
      canceledExternalBotIds: ['superseded-bot'],
    });
    expect(getDeleteCalls()).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/bot/superseded-bot/`,
      expect.objectContaining({ method: 'DELETE' }),
    );
  });

  it('cancels bots whose call recording no longer exists', async () => {
    stubRecallApi({
      bots: [
        buildCurrentWorkspaceBot({
          id: 'orphan-bot',
          twentyCallRecordingId: 'call-recording-gone',
        }),
      ],
    });

    const result = await cleanupOrphanedRecallBots({
      client: buildClient([]),
      joinAtAfter: JOIN_AT_AFTER,
      joinAtBefore: JOIN_AT_BEFORE,
    });

    expect(result).toEqual({
      scannedBotCount: 1,
      truncatedBotList: false,
      canceledExternalBotIds: ['orphan-bot'],
    });
  });

  it('grants a grace round to requested recordings without a bot id yet', async () => {
    stubRecallApi({
      bots: [
        buildCurrentWorkspaceBot({
          id: 'pending-bot',
          twentyCallRecordingId: 'call-recording-1',
        }),
      ],
    });

    const result = await cleanupOrphanedRecallBots({
      client: buildClient([
        {
          id: 'call-recording-1',
          recordingRequestStatus: 'REQUESTED',
          externalBotId: null,
        },
      ]),
      joinAtAfter: JOIN_AT_AFTER,
      joinAtBefore: JOIN_AT_BEFORE,
    });

    expect(result).toEqual({
      scannedBotCount: 1,
      truncatedBotList: false,
      canceledExternalBotIds: [],
    });
    expect(getDeleteCalls()).toHaveLength(0);
  });

  it('ignores bots that were not created by this app', async () => {
    stubRecallApi({ bots: [buildBot({ id: 'unrelated-bot' })] });

    const result = await cleanupOrphanedRecallBots({
      client: buildClient([]),
      joinAtAfter: JOIN_AT_AFTER,
      joinAtBefore: JOIN_AT_BEFORE,
    });

    expect(result).toEqual({
      scannedBotCount: 1,
      truncatedBotList: false,
      canceledExternalBotIds: [],
    });
    expect(getDeleteCalls()).toHaveLength(0);
  });

  it('ignores untagged bots even when they carry call recording metadata', async () => {
    stubRecallApi({
      bots: [
        buildBot({
          id: 'untagged-bot',
          twentyCallRecordingId: 'call-recording-gone',
        }),
      ],
    });

    const result = await cleanupOrphanedRecallBots({
      client: buildClient([]),
      joinAtAfter: JOIN_AT_AFTER,
      joinAtBefore: JOIN_AT_BEFORE,
    });

    expect(result).toEqual({
      scannedBotCount: 1,
      truncatedBotList: false,
      canceledExternalBotIds: [],
    });
    expect(getDeleteCalls()).toHaveLength(0);
  });

  it('ignores bots claimed by another workspace', async () => {
    stubRecallApi({
      bots: [
        buildBot({
          id: 'other-workspace-bot',
          twentyCallRecordingId: 'call-recording-gone',
          twentyWorkspaceId: OTHER_WORKSPACE_ID,
        }),
      ],
    });

    const result = await cleanupOrphanedRecallBots({
      client: buildClient([]),
      joinAtAfter: JOIN_AT_AFTER,
      joinAtBefore: JOIN_AT_BEFORE,
    });

    expect(result).toEqual({
      scannedBotCount: 1,
      truncatedBotList: false,
      canceledExternalBotIds: [],
    });
    expect(getDeleteCalls()).toHaveLength(0);
  });

  it('cancels orphaned bots claimed by this workspace', async () => {
    stubRecallApi({
      bots: [
        buildCurrentWorkspaceBot({
          id: 'same-workspace-bot',
          twentyCallRecordingId: 'call-recording-gone',
        }),
      ],
    });

    const result = await cleanupOrphanedRecallBots({
      client: buildClient([]),
      joinAtAfter: JOIN_AT_AFTER,
      joinAtBefore: JOIN_AT_BEFORE,
    });

    expect(result).toEqual({
      scannedBotCount: 1,
      truncatedBotList: false,
      canceledExternalBotIds: ['same-workspace-bot'],
    });
    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/bot/same-workspace-bot/`,
      expect.objectContaining({ method: 'DELETE' }),
    );
  });

  it('ejects an orphaned bot that already joined when deletion is rejected', async () => {
    // 409s are retryable, so fake timers skip the cancel backoff sleeps.
    vi.useFakeTimers();
    stubRecallApi({
      bots: [
        buildCurrentWorkspaceBot({
          id: 'in-call-orphan',
          twentyCallRecordingId: 'call-recording-gone',
        }),
      ],
      cancelStatus: 409,
    });

    const resultPromise = cleanupOrphanedRecallBots({
      client: buildClient([]),
      joinAtAfter: JOIN_AT_AFTER,
      joinAtBefore: JOIN_AT_BEFORE,
    });

    await vi.runAllTimersAsync();

    expect(await resultPromise).toEqual({
      scannedBotCount: 1,
      truncatedBotList: false,
      canceledExternalBotIds: ['in-call-orphan'],
    });
    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/bot/in-call-orphan/leave_call/`,
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('cancels fetched orphans and flags the sweep as partial when pages remain', async () => {
    let listCallCount = 0;

    fetchMock.mockImplementation(async (_url: string, init: RequestInit) => {
      if (init.method === 'DELETE') {
        return buildJsonResponse(204);
      }

      listCallCount += 1;

      return {
        ok: true,
        status: 200,
        json: async () => ({
          next: `${BASE_URL}/bot/?cursor=page-${listCallCount + 1}`,
          results:
            listCallCount === 1
              ? [
                  buildCurrentWorkspaceBot({
                    id: 'orphan-bot',
                    twentyCallRecordingId: 'call-recording-gone',
                  }),
                ]
              : [],
        }),
      };
    });

    const result = await cleanupOrphanedRecallBots({
      client: buildClient([]),
      joinAtAfter: JOIN_AT_AFTER,
      joinAtBefore: JOIN_AT_BEFORE,
    });

    expect(result).toEqual({
      scannedBotCount: 1,
      truncatedBotList: true,
      canceledExternalBotIds: ['orphan-bot'],
    });
    expect(
      fetchMock.mock.calls.filter(([, init]) => init.method === 'GET'),
    ).toHaveLength(10);
    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/bot/orphan-bot/`,
      expect.objectContaining({ method: 'DELETE' }),
    );
  });

  it('reports nothing canceled when listing Recall bots fails', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ detail: 'bad request' }),
    });

    const result = await cleanupOrphanedRecallBots({
      client: buildClient([]),
      joinAtAfter: JOIN_AT_AFTER,
      joinAtBefore: JOIN_AT_BEFORE,
    });

    expect(result).toEqual({
      scannedBotCount: 0,
      truncatedBotList: false,
      canceledExternalBotIds: [],
    });
    expect(getDeleteCalls()).toHaveLength(0);
  });

  it('skips cancellation without listing bots when the current workspace cannot be resolved', async () => {
    delete process.env.TWENTY_APP_ACCESS_TOKEN;
    stubRecallApi({
      bots: [
        buildCurrentWorkspaceBot({
          id: 'same-workspace-bot',
          twentyCallRecordingId: 'call-recording-gone',
        }),
      ],
    });

    const result = await cleanupOrphanedRecallBots({
      client: buildClient([]),
      joinAtAfter: JOIN_AT_AFTER,
      joinAtBefore: JOIN_AT_BEFORE,
    });

    expect(result).toEqual({
      scannedBotCount: 0,
      truncatedBotList: false,
      canceledExternalBotIds: [],
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
