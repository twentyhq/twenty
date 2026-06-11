import { type CoreApiClient } from 'twenty-client-sdk/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { reconcilePendingRecallTranscripts } from 'src/logic-functions/utils/reconcile-pending-recall-transcripts.util';

const retrieveRecallTranscriptMock = vi.hoisted(() => vi.fn());

vi.mock('src/logic-functions/utils/retrieve-recall-transcript.util', () => ({
  retrieveRecallTranscript: retrieveRecallTranscriptMock,
}));

const NOW = new Date('2026-06-10T12:00:00.000Z');
const STALE_REQUESTED_AT = '2026-06-10T10:00:00.000Z';

type CallRecordingNode = {
  id: string;
  transcript?: unknown;
};

class FakeCoreApiClient {
  mutations: Array<{ id: string; data: Record<string, unknown> }> = [];

  constructor(private callRecordingNodes: CallRecordingNode[]) {}

  async query(_query: any): Promise<any> {
    return {
      callRecordings: {
        pageInfo: { hasNextPage: false, endCursor: undefined },
        edges: this.callRecordingNodes.map((node) => ({ node })),
      },
    };
  }

  async mutation(mutation: any): Promise<any> {
    const { id, data } = mutation.updateCallRecording.__args;

    this.mutations.push({ id, data });

    return { updateCallRecording: { id } };
  }
}

describe('reconcilePendingRecallTranscripts', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    retrieveRecallTranscriptMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fills a stale pending marker from the downloaded transcript', async () => {
    const transcriptContent = [{ participant: { id: 1 }, words: [] }];

    retrieveRecallTranscriptMock.mockResolvedValue({
      ok: true,
      transcript: {
        downloadUrl: 'https://recall-transcripts.example.com/transcript-1',
        statusCode: 'done',
        statusSubCode: null,
      },
    });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => transcriptContent,
      }),
    );

    const client = new FakeCoreApiClient([
      {
        id: 'call-recording-1',
        transcript: {
          recallTranscriptId: 'recall-transcript-1',
          status: 'PENDING',
          requestedAt: STALE_REQUESTED_AT,
        },
      },
    ]);

    const result = await reconcilePendingRecallTranscripts({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(retrieveRecallTranscriptMock).toHaveBeenCalledWith({
      transcriptId: 'recall-transcript-1',
    });
    expect(client.mutations).toEqual([
      { id: 'call-recording-1', data: { transcript: transcriptContent } },
    ]);
    expect(result).toEqual({
      pendingMarkerCount: 1,
      filledCallRecordingIds: ['call-recording-1'],
      failedCallRecordingIds: [],
    });
  });

  it('leaves recently requested pending markers alone', async () => {
    const client = new FakeCoreApiClient([
      {
        id: 'call-recording-1',
        transcript: {
          recallTranscriptId: 'recall-transcript-1',
          status: 'PENDING',
          requestedAt: '2026-06-10T11:50:00.000Z',
        },
      },
    ]);

    const result = await reconcilePendingRecallTranscripts({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(retrieveRecallTranscriptMock).not.toHaveBeenCalled();
    expect(client.mutations).toEqual([]);
    expect(result.pendingMarkerCount).toBe(1);
  });

  it('fails a stale pending marker whose transcript errored at Recall', async () => {
    retrieveRecallTranscriptMock.mockResolvedValue({
      ok: true,
      transcript: {
        downloadUrl: null,
        statusCode: 'error',
        statusSubCode: 'audio_missing',
      },
    });

    const client = new FakeCoreApiClient([
      {
        id: 'call-recording-1',
        transcript: {
          recallTranscriptId: 'recall-transcript-1',
          status: 'PENDING',
          requestedAt: STALE_REQUESTED_AT,
        },
      },
    ]);

    const result = await reconcilePendingRecallTranscripts({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(client.mutations).toEqual([
      {
        id: 'call-recording-1',
        data: {
          transcript: {
            recallTranscriptId: 'recall-transcript-1',
            status: 'FAILED',
            subCode: 'audio_missing',
          },
        },
      },
    ]);
    expect(result.failedCallRecordingIds).toEqual(['call-recording-1']);
  });

  it('keeps a still-processing stale marker pending', async () => {
    retrieveRecallTranscriptMock.mockResolvedValue({
      ok: true,
      transcript: {
        downloadUrl: null,
        statusCode: 'processing',
        statusSubCode: null,
      },
    });

    const client = new FakeCoreApiClient([
      {
        id: 'call-recording-1',
        transcript: {
          recallTranscriptId: 'recall-transcript-1',
          status: 'PENDING',
          requestedAt: STALE_REQUESTED_AT,
        },
      },
    ]);

    const result = await reconcilePendingRecallTranscripts({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(client.mutations).toEqual([]);
    expect(result.filledCallRecordingIds).toEqual([]);
    expect(result.failedCallRecordingIds).toEqual([]);
  });

  it('ignores records holding real transcript content or FAILED markers', async () => {
    const client = new FakeCoreApiClient([
      {
        id: 'call-recording-1',
        transcript: [{ participant: { id: 1 }, words: [] }],
      },
      {
        id: 'call-recording-2',
        transcript: {
          recallTranscriptId: 'recall-transcript-2',
          status: 'FAILED',
          subCode: 'transcription_failed',
        },
      },
    ]);

    const result = await reconcilePendingRecallTranscripts({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(retrieveRecallTranscriptMock).not.toHaveBeenCalled();
    expect(result.pendingMarkerCount).toBe(0);
  });
});
