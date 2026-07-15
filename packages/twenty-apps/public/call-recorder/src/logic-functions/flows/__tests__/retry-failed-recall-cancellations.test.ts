import { type CoreApiClient } from 'twenty-client-sdk/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { retryFailedRecallCancellations } from 'src/logic-functions/flows/retry-failed-recall-cancellations.util';

const BASE_URL = 'https://us-west-2.recall.ai/api/v1';

type CallRecordingNode = {
  id: string;
  recordingRequestStatus?: string | null;
  status?: string | null;
  externalBotId?: string | null;
};

class FakeCoreApiClient {
  callRecordings: CallRecordingNode[];
  filters: Array<Record<string, unknown>> = [];
  mutations: Array<{ id: string; data: Record<string, unknown> }> = [];

  constructor(callRecordings: CallRecordingNode[]) {
    this.callRecordings = callRecordings;
  }

  async query(query: any): Promise<any> {
    this.filters.push(query.callRecordings.__args.filter);

    return {
      callRecordings: {
        pageInfo: { hasNextPage: false, endCursor: undefined },
        edges: this.callRecordings.map((node) => ({ node })),
      },
    };
  }

  async mutation(mutation: any): Promise<any> {
    const { id, data } = mutation.updateCallRecording.__args;

    this.mutations.push({ id, data });

    return { updateCallRecording: { id } };
  }
}

const fetchMock = vi.fn();

const buildJsonResponse = (status: number) => ({
  ok: status < 400,
  status,
  json: async () => ({}),
});

describe('retryFailedRecallCancellations', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('RECALL_API_KEY', 'recall-api-key');
    vi.stubEnv('RECALL_REGION', 'us-west-2');
    fetchMock.mockReset();
    fetchMock.mockImplementation(async () => buildJsonResponse(204));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('queries only canceled non-terminal recordings that still hold a bot id', async () => {
    const client = new FakeCoreApiClient([]);

    await retryFailedRecallCancellations({
      client: client as unknown as CoreApiClient,
    });

    expect(client.filters).toEqual([
      expect.objectContaining({
        recordingRequestStatus: { eq: 'CANCELED' },
        status: {
          in: ['SCHEDULED', 'JOINING', 'RECORDING', 'PROCESSING'],
        },
        externalBotId: { is: 'NOT_NULL' },
      }),
    ]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('cancels the bot and clears the id when the Recall cancel succeeds', async () => {
    const client = new FakeCoreApiClient([
      {
        id: 'call-recording-1',
        recordingRequestStatus: 'CANCELED',
        status: 'SCHEDULED',
        externalBotId: 'recall-bot-1',
      },
    ]);

    const result = await retryFailedRecallCancellations({
      client: client as unknown as CoreApiClient,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/bot/recall-bot-1/`,
      expect.objectContaining({ method: 'DELETE' }),
    );
    expect(client.mutations).toEqual([
      { id: 'call-recording-1', data: { externalBotId: null } },
    ]);
    expect(result.canceledExternalBotCallRecordingIds).toEqual([
      'call-recording-1',
    ]);
  });

  it('keeps the bot id when the Recall cancel fails so the next run retries', async () => {
    fetchMock.mockImplementation(async () => buildJsonResponse(400));
    const client = new FakeCoreApiClient([
      {
        id: 'call-recording-1',
        recordingRequestStatus: 'CANCELED',
        status: 'SCHEDULED',
        externalBotId: 'recall-bot-1',
      },
    ]);

    const result = await retryFailedRecallCancellations({
      client: client as unknown as CoreApiClient,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/bot/recall-bot-1/leave_call/`,
      expect.objectContaining({ method: 'POST' }),
    );
    expect(client.mutations).toEqual([]);
    expect(result.canceledExternalBotCallRecordingIds).toEqual([]);
  });
});
