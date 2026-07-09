import { type CoreApiClient } from 'twenty-client-sdk/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { finishFailedRecallCancellations } from 'src/logic-functions/flows/finish-failed-recall-cancellations.util';

const cancelOrEjectRecallBotMock = vi.hoisted(() => vi.fn());

vi.mock(
  'src/logic-functions/recall-api/cancel-or-eject-recall-bot.util',
  () => ({
    cancelOrEjectRecallBot: cancelOrEjectRecallBotMock,
  }),
);

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

describe('finishFailedRecallCancellations', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    cancelOrEjectRecallBotMock.mockReset();
    cancelOrEjectRecallBotMock.mockResolvedValue(true);
  });

  it('queries only canceled non-terminal recordings that still hold a bot id', async () => {
    const client = new FakeCoreApiClient([]);

    await finishFailedRecallCancellations({
      client: client as unknown as CoreApiClient,
    });

    expect(client.filters).toEqual([
      expect.objectContaining({
        recordingRequestStatus: { eq: 'CANCELED' },
        externalBotId: { is: 'NOT_NULL' },
      }),
    ]);
    expect(cancelOrEjectRecallBotMock).not.toHaveBeenCalled();
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

    const result = await finishFailedRecallCancellations({
      client: client as unknown as CoreApiClient,
    });

    expect(cancelOrEjectRecallBotMock).toHaveBeenCalledWith('recall-bot-1');
    expect(client.mutations).toEqual([
      { id: 'call-recording-1', data: { externalBotId: null } },
    ]);
    expect(result.canceledExternalBotCallRecordingIds).toEqual([
      'call-recording-1',
    ]);
  });

  it('keeps the bot id when the Recall cancel fails so the next run retries', async () => {
    cancelOrEjectRecallBotMock.mockResolvedValue(false);
    const client = new FakeCoreApiClient([
      {
        id: 'call-recording-1',
        recordingRequestStatus: 'CANCELED',
        status: 'SCHEDULED',
        externalBotId: 'recall-bot-1',
      },
    ]);

    const result = await finishFailedRecallCancellations({
      client: client as unknown as CoreApiClient,
    });

    expect(client.mutations).toEqual([]);
    expect(result.canceledExternalBotCallRecordingIds).toEqual([]);
  });
});
