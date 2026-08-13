import { type CoreApiClient } from 'twenty-client-sdk/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { retryUnresolvedRecallBotRemovals } from 'src/logic-functions/flows/retry-unresolved-recall-bot-removals.util';

const BASE_URL = 'https://us-west-2.recall.ai/api/v1';
const WORKSPACE_ID = '123e4567-e89b-12d3-a456-426614174000';

const buildAccessToken = (payload: Record<string, unknown>): string =>
  [
    Buffer.from(JSON.stringify({ alg: 'none' })).toString('base64url'),
    Buffer.from(JSON.stringify(payload)).toString('base64url'),
    'signature',
  ].join('.');

type CallRecordingNode = {
  id: string;
  status?: string | null;
  recordingRequestStatus?: string | null;
  deletedAt?: string | null;
  externalBotId?: string | null;
  botScheduleAttemptedAt?: string | null;
  botScheduleIdempotencyKey?: string | null;
};

class FakeCoreApiClient {
  filters: Array<Record<string, unknown>> = [];
  mutations: Array<{ id: string; data: Record<string, unknown> }> = [];

  constructor(public callRecordings: CallRecordingNode[]) {}

  async query(query: any): Promise<any> {
    const filter = query.callRecordings.__args.filter;

    this.filters.push(filter);

    const matches = this.callRecordings.filter((callRecording) =>
      filter.or.some(
        (condition: any) =>
          condition.status.in.includes(callRecording.status) &&
          (condition.deletedAt?.is === 'NOT_NULL'
            ? callRecording.deletedAt !== null &&
              callRecording.deletedAt !== undefined
            : callRecording.recordingRequestStatus ===
              condition.recordingRequestStatus.eq),
      ),
    );

    return { callRecordings: buildConnection(matches) };
  }

  async mutation(mutation: any): Promise<any> {
    const { filter, data } = mutation.updateCallRecordings.__args;
    const matches = this.callRecordings.filter(
      (callRecording) =>
        callRecording.id === filter.id.eq &&
        matchesNullableFilter(
          callRecording.externalBotId,
          filter.externalBotId,
        ) &&
        matchesNullableFilter(
          callRecording.botScheduleIdempotencyKey,
          filter.botScheduleIdempotencyKey,
        ),
    );

    matches.forEach((callRecording) => {
      this.mutations.push({ id: callRecording.id, data });
      Object.assign(callRecording, data);
    });

    return {
      updateCallRecordings: matches.map((callRecording) => ({
        id: callRecording.id,
      })),
    };
  }
}

const matchesNullableFilter = (
  value: string | null | undefined,
  filter: { eq?: string; is?: string },
): boolean =>
  filter.is === 'NULL'
    ? value === null || value === undefined
    : value === filter.eq;

const buildConnection = <Node>(nodes: Node[]) => ({
  pageInfo: { hasNextPage: false, endCursor: undefined },
  edges: nodes.map((node) => ({ node })),
});

const fetchMock = vi.fn();

const buildCanceledCallRecording = (
  overrides: Partial<CallRecordingNode> = {},
): CallRecordingNode => ({
  id: 'call-recording-1',
  status: 'SCHEDULED',
  recordingRequestStatus: 'CANCELED',
  externalBotId: 'recall-bot-1',
  botScheduleAttemptedAt: '2026-01-01T10:00:00.000Z',
  botScheduleIdempotencyKey: 'schedule-generation-1',
  ...overrides,
});

const stubRecallBotList = (bots: unknown[]) => {
  fetchMock.mockImplementation(
    async (requestUrl: string, requestInit?: RequestInit) => {
      if (requestUrl.startsWith(`${BASE_URL}/bot/?`)) {
        return new Response(JSON.stringify({ next: null, results: bots }), {
          status: 200,
        });
      }

      if (requestInit?.method === 'DELETE') {
        return new Response(null, { status: 204 });
      }

      throw new Error(`Unhandled fetch: ${requestUrl}`);
    },
  );
};

describe('retryUnresolvedRecallBotRemovals', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T12:00:00.000Z'));
    vi.clearAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('RECALL_API_KEY', 'recall-api-key');
    vi.stubEnv('RECALL_REGION', 'us-west-2');
    vi.stubEnv(
      'TWENTY_APP_ACCESS_TOKEN',
      buildAccessToken({ workspaceId: WORKSPACE_ID }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('does not call Recall when there are no removal candidates', async () => {
    const client = new FakeCoreApiClient([]);

    const result = await retryUnresolvedRecallBotRemovals({
      client: client as unknown as CoreApiClient,
    });

    expect(result).toEqual({
      removedCallRecordingIds: [],
      failedCallRecordingIds: [],
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('queries canceled and soft-deleted active recordings', async () => {
    const client = new FakeCoreApiClient([]);

    await retryUnresolvedRecallBotRemovals({
      client: client as unknown as CoreApiClient,
    });

    expect(client.filters).toEqual([
      {
        or: [
          {
            recordingRequestStatus: { eq: 'CANCELED' },
            status: { in: ['SCHEDULED', 'JOINING', 'RECORDING'] },
          },
          {
            deletedAt: { is: 'NOT_NULL' },
            status: { in: ['SCHEDULED', 'JOINING', 'RECORDING'] },
          },
        ],
      },
    ]);
  });

  it('removes every bot from the unresolved generation and clears ownership', async () => {
    stubRecallBotList([
      {
        id: 'recall-bot-1',
        metadata: {
          twentyWorkspaceId: WORKSPACE_ID,
          twentyCallRecordingId: 'call-recording-1',
          twentyBotScheduleIdempotencyKey: 'schedule-generation-1',
        },
      },
      {
        id: 'recall-bot-superseded',
        metadata: {
          twentyWorkspaceId: WORKSPACE_ID,
          twentyCallRecordingId: 'call-recording-1',
          twentyBotScheduleIdempotencyKey: 'schedule-generation-1',
        },
      },
    ]);
    const client = new FakeCoreApiClient([buildCanceledCallRecording()]);

    const result = await retryUnresolvedRecallBotRemovals({
      client: client as unknown as CoreApiClient,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/bot/recall-bot-1/`,
      expect.objectContaining({ method: 'DELETE' }),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/bot/recall-bot-superseded/`,
      expect.objectContaining({ method: 'DELETE' }),
    );
    expect(client.mutations).toEqual([
      {
        id: 'call-recording-1',
        data: {
          externalBotId: null,
          botScheduleAttemptedAt: null,
          botScheduleIdempotencyKey: null,
        },
      },
    ]);
    expect(result).toEqual({
      removedCallRecordingIds: ['call-recording-1'],
      failedCallRecordingIds: [],
    });
  });

  it('does not remove a bot from a newer generation after restoration', async () => {
    stubRecallBotList([
      {
        id: 'recall-bot-new',
        metadata: {
          twentyWorkspaceId: WORKSPACE_ID,
          twentyCallRecordingId: 'call-recording-1',
          twentyBotScheduleIdempotencyKey: 'schedule-generation-2',
        },
      },
    ]);
    const client = new FakeCoreApiClient([
      buildCanceledCallRecording({ externalBotId: null }),
    ]);

    await retryUnresolvedRecallBotRemovals({
      client: client as unknown as CoreApiClient,
    });

    expect(fetchMock).not.toHaveBeenCalledWith(
      `${BASE_URL}/bot/recall-bot-new/`,
      expect.anything(),
    );
  });

  it('keeps ownership retryable when the Recall lookup fails', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ detail: 'failed' }), { status: 400 }),
    );
    const callRecording = buildCanceledCallRecording({ externalBotId: null });
    const client = new FakeCoreApiClient([callRecording]);

    const result = await retryUnresolvedRecallBotRemovals({
      client: client as unknown as CoreApiClient,
    });

    expect(client.mutations).toEqual([]);
    expect(callRecording.botScheduleAttemptedAt).toBe(
      '2026-01-01T10:00:00.000Z',
    );
    expect(result.failedCallRecordingIds).toEqual(['call-recording-1']);
  });

  it('keeps a recent unresolved attempt retryable when no bot is visible yet', async () => {
    stubRecallBotList([]);
    const callRecording = buildCanceledCallRecording({
      externalBotId: null,
      botScheduleAttemptedAt: '2026-01-01T11:59:30.000Z',
    });
    const client = new FakeCoreApiClient([callRecording]);

    const result = await retryUnresolvedRecallBotRemovals({
      client: client as unknown as CoreApiClient,
    });

    expect(client.mutations).toEqual([]);
    expect(result.failedCallRecordingIds).toEqual(['call-recording-1']);
  });

  it('continues with the next candidate after one removal fails', async () => {
    stubRecallBotList([]);
    fetchMock.mockImplementation(
      async (requestUrl: string, requestInit?: RequestInit) => {
        if (requestUrl.startsWith(`${BASE_URL}/bot/?`)) {
          return new Response(JSON.stringify({ next: null, results: [] }), {
            status: 200,
          });
        }

        if (requestUrl.endsWith('/recall-bot-1/')) {
          return new Response(JSON.stringify({ detail: 'failed' }), {
            status: 400,
          });
        }

        if (requestInit?.method === 'POST') {
          return new Response(JSON.stringify({ detail: 'failed' }), {
            status: 400,
          });
        }

        return new Response(null, { status: 204 });
      },
    );
    const client = new FakeCoreApiClient([
      buildCanceledCallRecording(),
      buildCanceledCallRecording({
        id: 'call-recording-2',
        externalBotId: 'recall-bot-2',
      }),
    ]);

    const result = await retryUnresolvedRecallBotRemovals({
      client: client as unknown as CoreApiClient,
    });

    expect(result.failedCallRecordingIds).toEqual(['call-recording-1']);
    expect(result.removedCallRecordingIds).toEqual(['call-recording-2']);
  });
});
