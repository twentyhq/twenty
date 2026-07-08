import { type CoreApiClient } from 'twenty-client-sdk/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { processRecallWebhookArtifacts } from 'src/logic-functions/flows/process-recall-webhook-artifacts.util';

const getRecallBotMock = vi.hoisted(() => vi.fn());
const listRecallTranscriptsMock = vi.hoisted(() => vi.fn());
const createAsyncRecallTranscriptMock = vi.hoisted(() => vi.fn());
const downloadTranscriptMock = vi.hoisted(() => vi.fn());
const ingestCallRecordingMediaMock = vi.hoisted(() => vi.fn());
const chargeCompletedCallRecordingMock = vi.hoisted(() => vi.fn());

vi.mock('src/logic-functions/recall-api/get-recall-bot.util', () => ({
  getRecallBot: getRecallBotMock,
}));

vi.mock('src/logic-functions/recall-api/list-recall-transcripts.util', () => ({
  listRecallTranscripts: listRecallTranscriptsMock,
}));

vi.mock(
  'src/logic-functions/recall-api/create-async-recall-transcript.util',
  () => ({
    createAsyncRecallTranscript: createAsyncRecallTranscriptMock,
  }),
);

vi.mock('src/logic-functions/flows/download-transcript.util', () => ({
  downloadTranscript: downloadTranscriptMock,
}));

vi.mock('src/logic-functions/flows/ingest-call-recording-media.util', () => ({
  ingestCallRecordingMedia: ingestCallRecordingMediaMock,
}));

vi.mock(
  'src/logic-functions/flows/charge-completed-call-recording.util',
  () => ({
    chargeCompletedCallRecording: chargeCompletedCallRecordingMock,
  }),
);

type CallRecordingNode = {
  id: string;
  status?: string | null;
  externalBotId?: string | null;
  externalRecordingId?: string | null;
  startedAt?: string | null;
  endedAt?: string | null;
  callRecorderFailureReason?: string | null;
  transcript?: unknown;
  audio?: unknown;
  video?: unknown;
};

class FakeCoreApiClient {
  mutations: Array<{ id: string; data: Record<string, unknown> }> = [];

  constructor(private callRecordings: CallRecordingNode[]) {}

  async query(query: any): Promise<any> {
    if (query.callRecordings !== undefined) {
      const id = query.callRecordings.__args.filter.id.eq;

      return {
        callRecordings: {
          edges: this.callRecordings
            .filter((callRecording) => callRecording.id === id)
            .map((node) => ({ node })),
        },
      };
    }

    throw new Error(`Unhandled query: ${JSON.stringify(query)}`);
  }

  async mutation(mutation: any): Promise<any> {
    if (mutation.updateCallRecordings !== undefined) {
      const { filter, data } = mutation.updateCallRecordings.__args;
      const id = filter.id.eq;

      this.mutations.push({ id, data });

      return { updateCallRecordings: [{ id }] };
    }

    if (mutation.updateCallRecording !== undefined) {
      const { id, data } = mutation.updateCallRecording.__args;

      this.mutations.push({ id, data });

      return { updateCallRecording: { id } };
    }

    throw new Error(`Unhandled mutation: ${JSON.stringify(mutation)}`);
  }
}

const buildClient = (callRecordings: CallRecordingNode[]) =>
  new FakeCoreApiClient(callRecordings);

const buildProcessingCallRecording = (
  overrides: Partial<CallRecordingNode> = {},
): CallRecordingNode => ({
  id: 'call-recording-1',
  status: 'PROCESSING',
  externalBotId: 'recall-bot-1',
  externalRecordingId: 'recall-recording-1',
  startedAt: '2026-01-01T13:02:00.000Z',
  endedAt: '2026-01-01T14:05:00.000Z',
  transcript: null,
  audio: null,
  video: null,
  ...overrides,
});

describe('processRecallWebhookArtifacts', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    getRecallBotMock.mockReset();
    getRecallBotMock.mockResolvedValue({
      ok: false,
      status: null,
      errorMessage: 'bot fetch disabled in test',
    });
    listRecallTranscriptsMock.mockReset();
    listRecallTranscriptsMock.mockResolvedValue({
      ok: true,
      transcripts: [],
    });
    createAsyncRecallTranscriptMock.mockReset();
    createAsyncRecallTranscriptMock.mockResolvedValue({
      ok: true,
      transcriptId: 'recall-transcript-1',
    });
    downloadTranscriptMock.mockReset();
    downloadTranscriptMock.mockResolvedValue({ outcome: 'pending' });
    ingestCallRecordingMediaMock.mockReset();
    ingestCallRecordingMediaMock.mockResolvedValue({});
    chargeCompletedCallRecordingMock.mockReset();
    chargeCompletedCallRecordingMock.mockResolvedValue(undefined);
  });

  it('requests transcript and media artifacts after a recording completion webhook', async () => {
    const client = buildClient([buildProcessingCallRecording()]);

    const result = await processRecallWebhookArtifacts({
      client: client as unknown as CoreApiClient,
      request: {
        event: 'recording.done',
        callRecordingId: 'call-recording-1',
        externalBotId: 'recall-bot-1',
        externalRecordingId: 'recall-recording-1',
        requestedAt: '2026-01-01T14:06:00.000Z',
      },
    });

    expect(createAsyncRecallTranscriptMock).toHaveBeenCalledWith({
      externalRecordingId: 'recall-recording-1',
    });
    expect(ingestCallRecordingMediaMock).toHaveBeenCalledWith({
      callRecordingId: 'call-recording-1',
      externalRecordingId: 'recall-recording-1',
      hasAudio: false,
      hasVideo: false,
    });
    expect(client.mutations).toEqual([
      {
        id: 'call-recording-1',
        data: {
          transcript: {
            recallTranscriptId: 'recall-transcript-1',
            status: 'PENDING',
            requestedAt: '2026-01-01T14:06:00.000Z',
          },
        },
      },
    ]);
    expect(result).toEqual({
      status: 'processed',
      event: 'recording.done',
      callRecordingId: 'call-recording-1',
      outcome: 'recording-artifacts-reconciled',
    });
  });

  it('resolves a missing recording id from the Recall bot inside the worker', async () => {
    getRecallBotMock.mockResolvedValue({
      ok: true,
      bot: {
        recordings: [{ id: 'recall-recording-9' }],
      },
    });
    const client = buildClient([
      buildProcessingCallRecording({ externalRecordingId: null }),
    ]);

    await processRecallWebhookArtifacts({
      client: client as unknown as CoreApiClient,
      request: {
        event: 'bot.status_change',
        callRecordingId: 'call-recording-1',
        externalBotId: 'recall-bot-1',
        requestedAt: '2026-01-01T14:06:00.000Z',
      },
    });

    expect(getRecallBotMock).toHaveBeenCalledWith({
      externalBotId: 'recall-bot-1',
    });
    expect(createAsyncRecallTranscriptMock).toHaveBeenCalledWith({
      externalRecordingId: 'recall-recording-9',
    });
    expect(client.mutations[0]).toEqual(
      expect.objectContaining({
        id: 'call-recording-1',
        data: expect.objectContaining({
          externalRecordingId: 'recall-recording-9',
        }),
      }),
    );
  });

  it('keeps a terminal webhook retryable when Recall has not exposed the recording id yet', async () => {
    getRecallBotMock.mockResolvedValue({
      ok: true,
      bot: {
        recordings: [],
      },
    });
    const client = buildClient([
      buildProcessingCallRecording({ externalRecordingId: null }),
    ]);

    const result = await processRecallWebhookArtifacts({
      client: client as unknown as CoreApiClient,
      request: {
        event: 'recording.done',
        callRecordingId: 'call-recording-1',
        externalBotId: 'recall-bot-1',
        requestedAt: '2026-01-01T14:06:00.000Z',
      },
    });

    expect(createAsyncRecallTranscriptMock).not.toHaveBeenCalled();
    expect(ingestCallRecordingMediaMock).not.toHaveBeenCalled();
    expect(client.mutations).toEqual([]);
    expect(result).toEqual({
      status: 'skipped',
      event: 'recording.done',
      callRecordingId: 'call-recording-1',
      reason: 'no artifact updates',
    });
  });

  it('completes and charges when artifact reconciliation lands the final media files', async () => {
    ingestCallRecordingMediaMock.mockResolvedValue({
      audio: [{ fileId: 'file-audio-1', label: 'audio.mp3' }],
      video: [{ fileId: 'file-video-1', label: 'video.mp4' }],
    });
    const client = buildClient([
      buildProcessingCallRecording({
        transcript: [{ participant: { id: 1 }, words: [] }],
      }),
    ]);

    await processRecallWebhookArtifacts({
      client: client as unknown as CoreApiClient,
      request: {
        event: 'recording.done',
        callRecordingId: 'call-recording-1',
        externalRecordingId: 'recall-recording-1',
        requestedAt: '2026-01-01T14:06:00.000Z',
      },
    });

    expect(client.mutations).toEqual([
      {
        id: 'call-recording-1',
        data: {
          audio: [{ fileId: 'file-audio-1', label: 'audio.mp3' }],
          video: [{ fileId: 'file-video-1', label: 'video.mp4' }],
        },
      },
      {
        id: 'call-recording-1',
        data: { status: 'COMPLETED' },
      },
    ]);
    expect(chargeCompletedCallRecordingMock).toHaveBeenCalledWith({
      callRecordingId: 'call-recording-1',
      startedAt: '2026-01-01T13:02:00.000Z',
      endedAt: '2026-01-01T14:05:00.000Z',
    });
  });

  it('completes when all artifacts were already present before the continuation ran', async () => {
    const client = buildClient([
      buildProcessingCallRecording({
        transcript: [{ participant: { id: 1 }, words: [] }],
        audio: [{ fileId: 'file-audio-1', label: 'audio.mp3' }],
        video: [{ fileId: 'file-video-1', label: 'video.mp4' }],
      }),
    ]);

    await processRecallWebhookArtifacts({
      client: client as unknown as CoreApiClient,
      request: {
        event: 'recording.done',
        callRecordingId: 'call-recording-1',
        externalRecordingId: 'recall-recording-1',
        requestedAt: '2026-01-01T14:06:00.000Z',
      },
    });

    expect(client.mutations).toEqual([
      {
        id: 'call-recording-1',
        data: { status: 'COMPLETED' },
      },
    ]);
    expect(chargeCompletedCallRecordingMock).toHaveBeenCalledWith({
      callRecordingId: 'call-recording-1',
      startedAt: '2026-01-01T13:02:00.000Z',
      endedAt: '2026-01-01T14:05:00.000Z',
    });
  });

  it('fills a transcript and completes once media is already ingested', async () => {
    const transcriptContent = [
      {
        participant: { id: 1, name: 'Alice' },
        words: [{ text: 'hello', start_timestamp: { relative: 0.5 } }],
      },
    ];

    downloadTranscriptMock.mockResolvedValue({
      outcome: 'filled',
      content: transcriptContent,
    });
    const client = buildClient([
      buildProcessingCallRecording({
        transcript: {
          recallTranscriptId: 'recall-transcript-1',
          status: 'PENDING',
          requestedAt: '2026-01-01T14:06:00.000Z',
        },
        audio: [{ fileId: 'file-audio-1', label: 'audio.mp3' }],
        video: [{ fileId: 'file-video-1', label: 'video.mp4' }],
      }),
    ]);

    const result = await processRecallWebhookArtifacts({
      client: client as unknown as CoreApiClient,
      request: {
        event: 'transcript.done',
        callRecordingId: 'call-recording-1',
        externalBotId: 'recall-bot-1',
        transcriptId: 'recall-transcript-1',
        requestedAt: '2026-01-01T14:06:00.000Z',
      },
    });

    expect(downloadTranscriptMock).toHaveBeenCalledWith({
      transcriptId: 'recall-transcript-1',
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
    expect(result).toEqual({
      status: 'processed',
      event: 'transcript.done',
      callRecordingId: 'call-recording-1',
      outcome: 'transcript-filled',
    });
  });

  it('does not clobber a downloaded transcript with a late transcript.failed', async () => {
    const client = buildClient([
      buildProcessingCallRecording({
        status: 'COMPLETED',
        transcript: [{ participant: { id: 1 }, words: [] }],
      }),
    ]);

    const result = await processRecallWebhookArtifacts({
      client: client as unknown as CoreApiClient,
      request: {
        event: 'transcript.failed',
        callRecordingId: 'call-recording-1',
        transcriptId: 'recall-transcript-1',
        transcriptFailureSubCode: 'transcription_failed',
        requestedAt: '2026-01-01T14:06:00.000Z',
      },
    });

    expect(result).toEqual({
      status: 'skipped',
      event: 'transcript.failed',
      callRecordingId: 'call-recording-1',
      reason: 'transcript already filled',
    });
    expect(client.mutations).toEqual([]);
  });

  it('writes a failed transcript marker when transcript.failed omits the transcript id', async () => {
    const client = buildClient([
      buildProcessingCallRecording({
        transcript: {
          recallTranscriptId: 'recall-transcript-1',
          status: 'PENDING',
          requestedAt: '2026-01-01T14:06:00.000Z',
        },
      }),
    ]);

    const result = await processRecallWebhookArtifacts({
      client: client as unknown as CoreApiClient,
      request: {
        event: 'transcript.failed',
        callRecordingId: 'call-recording-1',
        transcriptFailureSubCode: 'transcription_failed',
        requestedAt: '2026-01-01T14:06:00.000Z',
      },
    });

    expect(client.mutations).toEqual([
      {
        id: 'call-recording-1',
        data: {
          transcript: {
            recallTranscriptId: 'recall-transcript-1',
            status: 'FAILED',
            subCode: 'transcription_failed',
          },
          callRecorderFailureReason: 'transcript_failed:transcription_failed',
          status: 'FAILED',
        },
      },
    ]);
    expect(result).toEqual({
      status: 'processed',
      event: 'transcript.failed',
      callRecordingId: 'call-recording-1',
      outcome: 'transcript-failed',
    });
  });
});
