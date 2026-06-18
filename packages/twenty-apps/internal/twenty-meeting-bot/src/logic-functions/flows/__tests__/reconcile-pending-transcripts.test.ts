import { type CoreApiClient } from 'twenty-client-sdk/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { reconcilePendingTranscripts } from 'src/logic-functions/flows/reconcile-pending-transcripts.util';

const retrieveRecallTranscriptMock = vi.hoisted(() => vi.fn());
const chargeCompletedCallRecordingMock = vi.hoisted(() => vi.fn());

vi.mock(
  'src/logic-functions/recall-api/retrieve-recall-transcript.util',
  () => ({
    retrieveRecallTranscript: retrieveRecallTranscriptMock,
  }),
);

vi.mock(
  'src/logic-functions/flows/charge-completed-call-recording.util',
  () => ({
    chargeCompletedCallRecording: chargeCompletedCallRecordingMock,
  }),
);

const NOW = new Date('2026-06-10T12:00:00.000Z');
const STALE_REQUESTED_AT = '2026-06-10T10:00:00.000Z';

type CallRecordingNode = {
  id: string;
  status?: string | null;
  startedAt?: string | null;
  endedAt?: string | null;
  transcript?: unknown;
  audio?: unknown;
  video?: unknown;
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
    if (mutation.updateCallRecordings !== undefined) {
      const { filter, data } = mutation.updateCallRecordings.__args;
      const id = filter.id.eq;

      this.mutations.push({ id, data });

      return { updateCallRecordings: [{ id }] };
    }

    const { id, data } = mutation.updateCallRecording.__args;

    this.mutations.push({ id, data });

    return { updateCallRecording: { id } };
  }
}

describe('reconcilePendingTranscripts', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    retrieveRecallTranscriptMock.mockReset();
    chargeCompletedCallRecordingMock.mockReset();
    chargeCompletedCallRecordingMock.mockResolvedValue(undefined);
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
        statusSubCode: undefined,
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

    const result = await reconcilePendingTranscripts({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(retrieveRecallTranscriptMock).toHaveBeenCalledWith({
      transcriptId: 'recall-transcript-1',
    });
    expect(client.mutations).toEqual([
      { id: 'call-recording-1', data: { transcript: transcriptContent } },
    ]);
    expect(chargeCompletedCallRecordingMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      pendingMarkerCount: 1,
      filledCallRecordingIds: ['call-recording-1'],
      failedCallRecordingIds: [],
    });
  });

  it('completes and charges when the late transcript is the last artifact', async () => {
    const transcriptContent = [{ participant: { id: 1 }, words: [] }];

    retrieveRecallTranscriptMock.mockResolvedValue({
      ok: true,
      transcript: {
        downloadUrl: 'https://recall-transcripts.example.com/transcript-1',
        statusCode: 'done',
        statusSubCode: undefined,
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
        status: 'PROCESSING',
        startedAt: '2026-06-10T09:00:00.000Z',
        endedAt: '2026-06-10T09:45:00.000Z',
        transcript: {
          recallTranscriptId: 'recall-transcript-1',
          status: 'PENDING',
          requestedAt: STALE_REQUESTED_AT,
        },
        audio: [{ fileId: 'file-audio-1', label: 'audio.mp3' }],
        video: [{ fileId: 'file-video-1', label: 'video.mp4' }],
      },
    ]);

    const result = await reconcilePendingTranscripts({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(client.mutations).toEqual([
      {
        id: 'call-recording-1',
        data: { transcript: transcriptContent },
      },
      {
        id: 'call-recording-1',
        data: { status: 'COMPLETED' },
      },
    ]);
    expect(chargeCompletedCallRecordingMock).toHaveBeenCalledWith({
      callRecordingId: 'call-recording-1',
      startedAt: '2026-06-10T09:00:00.000Z',
      endedAt: '2026-06-10T09:45:00.000Z',
    });
    expect(result.filledCallRecordingIds).toEqual(['call-recording-1']);
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

    const result = await reconcilePendingTranscripts({
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
        downloadUrl: undefined,
        statusCode: 'error',
        statusSubCode: 'audio_missing',
      },
    });

    const client = new FakeCoreApiClient([
      {
        id: 'call-recording-1',
        status: 'PROCESSING',
        transcript: {
          recallTranscriptId: 'recall-transcript-1',
          status: 'PENDING',
          requestedAt: STALE_REQUESTED_AT,
        },
      },
    ]);

    const result = await reconcilePendingTranscripts({
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
          status: 'FAILED_UNKNOWN',
        },
      },
    ]);
    expect(result.failedCallRecordingIds).toEqual(['call-recording-1']);
  });

  it('keeps a still-processing stale marker pending', async () => {
    retrieveRecallTranscriptMock.mockResolvedValue({
      ok: true,
      transcript: {
        downloadUrl: undefined,
        statusCode: 'processing',
        statusSubCode: undefined,
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

    const result = await reconcilePendingTranscripts({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(client.mutations).toEqual([]);
    expect(result.filledCallRecordingIds).toEqual([]);
    expect(result.failedCallRecordingIds).toEqual([]);
  });

  it('fails a stale pending marker without a Recall transcript id', async () => {
    const client = new FakeCoreApiClient([
      {
        id: 'call-recording-1',
        status: 'PROCESSING',
        transcript: {
          recallTranscriptId: null,
          status: 'PENDING',
          requestedAt: STALE_REQUESTED_AT,
        },
      },
    ]);

    const result = await reconcilePendingTranscripts({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(retrieveRecallTranscriptMock).not.toHaveBeenCalled();
    expect(client.mutations).toEqual([
      {
        id: 'call-recording-1',
        data: {
          transcript: {
            recallTranscriptId: null,
            status: 'FAILED',
            subCode: 'missing_transcript_id',
          },
          status: 'FAILED_UNKNOWN',
        },
      },
    ]);
    expect(result.failedCallRecordingIds).toEqual(['call-recording-1']);
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

    const result = await reconcilePendingTranscripts({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(retrieveRecallTranscriptMock).not.toHaveBeenCalled();
    expect(result.pendingMarkerCount).toBe(0);
  });
});
