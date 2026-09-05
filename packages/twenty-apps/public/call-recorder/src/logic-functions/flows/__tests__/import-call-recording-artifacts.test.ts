import { type CoreApiClient } from 'twenty-client-sdk/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { importCallRecordingArtifacts } from 'src/logic-functions/flows/import-call-recording-artifacts.util';

const getRecallBotMock = vi.hoisted(() => vi.fn());
const listRecallTranscriptsMock = vi.hoisted(() => vi.fn());
const createAsyncRecallTranscriptMock = vi.hoisted(() => vi.fn());
const downloadTranscriptMock = vi.hoisted(() => vi.fn());
const importCallRecordingMediaMock = vi.hoisted(() => vi.fn());
const chargeCompletedCallRecordingMock = vi.hoisted(() => vi.fn());
const claimArtifactsImportMock = vi.hoisted(() => vi.fn());
const releaseArtifactsImportClaimMock = vi.hoisted(() => vi.fn());

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

vi.mock('src/logic-functions/flows/import-call-recording-media.util', () => ({
  importCallRecordingMedia: importCallRecordingMediaMock,
}));

vi.mock(
  'src/logic-functions/flows/charge-completed-call-recording.util',
  () => ({
    chargeCompletedCallRecording: chargeCompletedCallRecordingMock,
  }),
);

vi.mock(
  'src/logic-functions/data/claim-call-recording-artifacts-import.util',
  () => ({
    claimCallRecordingArtifactsImport: claimArtifactsImportMock,
    releaseCallRecordingArtifactsImportClaim: releaseArtifactsImportClaimMock,
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
            .map((node) => ({ node: { ...node } })),
        },
      };
    }

    throw new Error(`Unhandled query: ${JSON.stringify(query)}`);
  }

  async mutation(mutation: any): Promise<any> {
    if (mutation.updateCallRecordings !== undefined) {
      const { filter, data } = mutation.updateCallRecordings.__args;
      const id = filter.id.eq;
      const node = this.callRecordings.find(
        (callRecording) => callRecording.id === id,
      );

      if (
        node === undefined ||
        (filter.status?.in !== undefined &&
          !filter.status.in.includes(node.status))
      ) {
        return { updateCallRecordings: [] };
      }

      this.mutations.push({ id, data });
      Object.assign(node, data);

      return { updateCallRecordings: [{ id }] };
    }

    if (mutation.updateCallRecording !== undefined) {
      const { id, data } = mutation.updateCallRecording.__args;
      const node = this.callRecordings.find(
        (callRecording) => callRecording.id === id,
      );

      this.mutations.push({ id, data });

      if (node !== undefined) {
        Object.assign(node, data);
      }

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

const buildRequest = () => ({
  callRecordingId: 'call-recording-1',
  requestedAt: '2026-01-01T14:06:00.000Z',
});

describe('importCallRecordingArtifacts', () => {
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
    importCallRecordingMediaMock.mockReset();
    importCallRecordingMediaMock.mockResolvedValue({
      updateData: {},
      hasRetryableFailure: false,
    });
    chargeCompletedCallRecordingMock.mockReset();
    chargeCompletedCallRecordingMock.mockResolvedValue('charged');
    claimArtifactsImportMock.mockReset();
    claimArtifactsImportMock.mockResolvedValue(true);
    releaseArtifactsImportClaimMock.mockReset();
    releaseArtifactsImportClaimMock.mockResolvedValue(undefined);
  });

  it('requests a transcript after a recording completion webhook without touching media', async () => {
    const client = buildClient([buildProcessingCallRecording()]);

    const result = await importCallRecordingArtifacts({
      client: client as unknown as CoreApiClient,
      request: buildRequest(),
      scope: 'transcript',
    });

    expect(createAsyncRecallTranscriptMock).toHaveBeenCalledWith({
      externalRecordingId: 'recall-recording-1',
    });
    expect(importCallRecordingMediaMock).not.toHaveBeenCalled();
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
      status: 'imported',
      callRecordingId: 'call-recording-1',
      scope: 'transcript',
      outcome: 'call-recording-artifacts-imported',
    });
  });

  it('refreshes persisted artifacts after claiming the scope', async () => {
    const callRecording = buildProcessingCallRecording();
    const client = buildClient([callRecording]);

    claimArtifactsImportMock.mockImplementation(async () => {
      callRecording.transcript = [{ participant: { id: 1 }, words: [] }];

      return true;
    });

    await importCallRecordingArtifacts({
      client: client as unknown as CoreApiClient,
      request: buildRequest(),
      scope: 'transcript',
    });

    expect(listRecallTranscriptsMock).not.toHaveBeenCalled();
    expect(createAsyncRecallTranscriptMock).not.toHaveBeenCalled();
  });

  it('imports media without touching the transcript provider', async () => {
    importCallRecordingMediaMock.mockResolvedValue({
      updateData: {
        audio: [{ fileId: 'file-audio-1', label: 'audio.mp3' }],
        video: [{ fileId: 'file-video-1', label: 'video.mp4' }],
      },
      hasRetryableFailure: false,
    });
    const client = buildClient([buildProcessingCallRecording()]);

    const result = await importCallRecordingArtifacts({
      client: client as unknown as CoreApiClient,
      request: buildRequest(),
      scope: 'media',
    });

    expect(importCallRecordingMediaMock).toHaveBeenCalledWith({
      callRecordingId: 'call-recording-1',
      externalRecordingId: 'recall-recording-1',
      hasAudio: false,
      hasVideo: false,
    });
    expect(listRecallTranscriptsMock).not.toHaveBeenCalled();
    expect(createAsyncRecallTranscriptMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      status: 'imported',
      callRecordingId: 'call-recording-1',
      scope: 'media',
      outcome: 'call-recording-artifacts-imported',
    });
  });

  it('resolves a missing recording id from the Recall bot inside the worker', async () => {
    getRecallBotMock.mockResolvedValue({
      ok: true,
      bot: {
        statusChanges: [],
        recordings: [
          {
            id: 'recall-recording-9',
            startedAt: undefined,
            completedAt: undefined,
          },
        ],
      },
    });
    const client = buildClient([
      buildProcessingCallRecording({ externalRecordingId: null }),
    ]);

    await importCallRecordingArtifacts({
      client: client as unknown as CoreApiClient,
      request: buildRequest(),
      scope: 'transcript',
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
        statusChanges: [],
        recordings: [],
      },
    });
    const client = buildClient([
      buildProcessingCallRecording({ externalRecordingId: null }),
    ]);

    const result = await importCallRecordingArtifacts({
      client: client as unknown as CoreApiClient,
      request: buildRequest(),
      scope: 'transcript',
    });

    expect(createAsyncRecallTranscriptMock).not.toHaveBeenCalled();
    expect(importCallRecordingMediaMock).not.toHaveBeenCalled();
    expect(client.mutations).toEqual([]);
    expect(result).toEqual({
      status: 'skipped',
      callRecordingId: 'call-recording-1',
      scope: 'transcript',
      reason: 'no artifact updates',
    });
  });

  it('completes and charges when the media job lands the final media files', async () => {
    importCallRecordingMediaMock.mockResolvedValue({
      updateData: {
        audio: [{ fileId: 'file-audio-1', label: 'audio.mp3' }],
        video: [{ fileId: 'file-video-1', label: 'video.mp4' }],
      },
      hasRetryableFailure: false,
    });
    const client = buildClient([
      buildProcessingCallRecording({
        transcript: [{ participant: { id: 1 }, words: [] }],
      }),
    ]);

    await importCallRecordingArtifacts({
      client: client as unknown as CoreApiClient,
      request: buildRequest(),
      scope: 'media',
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

    await importCallRecordingArtifacts({
      client: client as unknown as CoreApiClient,
      request: buildRequest(),
      scope: 'media',
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

  it('fills a transcript and completes once media is already imported', async () => {
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

    const result = await importCallRecordingArtifacts({
      client: client as unknown as CoreApiClient,
      request: buildRequest(),
      scope: 'transcript',
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
      status: 'imported',
      callRecordingId: 'call-recording-1',
      scope: 'transcript',
      outcome: 'call-recording-artifacts-imported',
    });
  });

  it('completes from the re-read when the partner job landed its half after this job read the record', async () => {
    const callRecording = buildProcessingCallRecording({
      transcript: {
        recallTranscriptId: 'recall-transcript-1',
        status: 'PENDING',
        requestedAt: '2026-01-01T14:06:00.000Z',
      },
    });
    const client = buildClient([callRecording]);

    importCallRecordingMediaMock.mockImplementation(async () => {
      callRecording.transcript = [{ participant: { id: 1 }, words: [] }];

      return {
        updateData: {
          audio: [{ fileId: 'file-audio-1', label: 'audio.mp3' }],
          video: [{ fileId: 'file-video-1', label: 'video.mp4' }],
        },
        hasRetryableFailure: false,
      };
    });

    await importCallRecordingArtifacts({
      client: client as unknown as CoreApiClient,
      request: buildRequest(),
      scope: 'media',
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

  it('leaves the record processing when the re-read still misses the partner half', async () => {
    importCallRecordingMediaMock.mockResolvedValue({
      updateData: {
        audio: [{ fileId: 'file-audio-1', label: 'audio.mp3' }],
        video: [{ fileId: 'file-video-1', label: 'video.mp4' }],
      },
      hasRetryableFailure: false,
    });
    const client = buildClient([
      buildProcessingCallRecording({
        transcript: {
          recallTranscriptId: 'recall-transcript-1',
          status: 'PENDING',
          requestedAt: '2026-01-01T14:06:00.000Z',
        },
      }),
    ]);

    await importCallRecordingArtifacts({
      client: client as unknown as CoreApiClient,
      request: buildRequest(),
      scope: 'media',
    });

    expect(client.mutations).toEqual([
      {
        id: 'call-recording-1',
        data: {
          audio: [{ fileId: 'file-audio-1', label: 'audio.mp3' }],
          video: [{ fileId: 'file-video-1', label: 'video.mp4' }],
        },
      },
    ]);
    expect(chargeCompletedCallRecordingMock).not.toHaveBeenCalled();
  });

  it('does not clobber a downloaded transcript with a late transcript.failed', async () => {
    const client = buildClient([
      buildProcessingCallRecording({
        status: 'COMPLETED',
        transcript: [{ participant: { id: 1 }, words: [] }],
      }),
    ]);

    const result = await importCallRecordingArtifacts({
      client: client as unknown as CoreApiClient,
      request: buildRequest(),
      scope: 'transcript',
    });

    expect(result).toEqual({
      status: 'skipped',
      callRecordingId: 'call-recording-1',
      scope: 'transcript',
      reason: 'no artifact updates',
    });
    expect(client.mutations).toEqual([]);
  });

  it('writes a failed transcript marker from the listed transcript on transcript.failed', async () => {
    listRecallTranscriptsMock.mockResolvedValue({
      ok: true,
      transcripts: [
        {
          id: 'recall-transcript-1',
          statusCode: 'failed',
          statusSubCode: 'transcription_failed',
        },
      ],
    });
    const client = buildClient([
      buildProcessingCallRecording({
        transcript: {
          recallTranscriptId: 'recall-transcript-1',
          status: 'PENDING',
          requestedAt: '2026-01-01T14:06:00.000Z',
        },
      }),
    ]);

    const result = await importCallRecordingArtifacts({
      client: client as unknown as CoreApiClient,
      request: buildRequest(),
      scope: 'transcript',
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
        },
      },
      {
        id: 'call-recording-1',
        data: {
          callRecorderFailureReason: 'transcript_failed:transcription_failed',
          status: 'FAILED',
        },
      },
    ]);
    expect(result).toEqual({
      status: 'imported',
      callRecordingId: 'call-recording-1',
      scope: 'transcript',
      outcome: 'call-recording-artifacts-imported',
    });
  });

  it('preserves terminal state while persisting media from stale provider work', async () => {
    getRecallBotMock.mockResolvedValue({
      ok: true,
      bot: {
        statusChanges: [
          { code: 'done', createdAt: '2026-01-01T14:05:00.000Z' },
        ],
        recordings: [
          {
            id: 'recall-recording-1',
            startedAt: '2026-01-01T13:02:00.000Z',
            completedAt: '2026-01-01T14:05:00.000Z',
          },
        ],
      },
    });
    const callRecording = buildProcessingCallRecording({
      status: 'RECORDING',
      externalRecordingId: null,
    });
    const client = buildClient([callRecording]);

    importCallRecordingMediaMock.mockImplementation(async () => {
      callRecording.status = 'FAILED';
      callRecording.callRecorderFailureReason =
        'transcript_failed:transcription_failed';

      return {
        updateData: {
          video: [{ fileId: 'file-video-1', label: 'video.mp4' }],
          callRecorderFailureReason: 'audio_file_too_large',
        },
        hasRetryableFailure: false,
      };
    });

    await importCallRecordingArtifacts({
      client: client as unknown as CoreApiClient,
      request: buildRequest(),
      scope: 'media',
    });

    expect(callRecording.status).toBe('FAILED');
    expect(callRecording.callRecorderFailureReason).toBe(
      'transcript_failed:transcription_failed',
    );
    expect(callRecording.video).toEqual([
      { fileId: 'file-video-1', label: 'video.mp4' },
    ]);
  });

  it('claims and releases the lease of its own scope only', async () => {
    const client = buildClient([buildProcessingCallRecording()]);

    await importCallRecordingArtifacts({
      client: client as unknown as CoreApiClient,
      request: buildRequest(),
      scope: 'transcript',
    });

    expect(claimArtifactsImportMock).toHaveBeenCalledWith(expect.anything(), {
      callRecordingId: 'call-recording-1',
      scope: 'transcript',
      now: expect.any(Date),
    });
    expect(releaseArtifactsImportClaimMock).toHaveBeenCalledWith(
      expect.anything(),
      { callRecordingId: 'call-recording-1', scope: 'transcript' },
    );
  });

  it('stands aside when another worker already holds the lease for this scope', async () => {
    claimArtifactsImportMock.mockResolvedValue(false);
    const client = buildClient([buildProcessingCallRecording()]);

    const result = await importCallRecordingArtifacts({
      client: client as unknown as CoreApiClient,
      request: buildRequest(),
      scope: 'transcript',
    });

    expect(createAsyncRecallTranscriptMock).not.toHaveBeenCalled();
    expect(importCallRecordingMediaMock).not.toHaveBeenCalled();
    expect(releaseArtifactsImportClaimMock).not.toHaveBeenCalled();
    expect(client.mutations).toEqual([]);
    expect(result).toEqual({
      status: 'skipped',
      callRecordingId: 'call-recording-1',
      scope: 'transcript',
      reason: 'artifact import already in progress',
    });
  });

  it('skips a call recording that no longer exists', async () => {
    const client = buildClient([]);

    const result = await importCallRecordingArtifacts({
      client: client as unknown as CoreApiClient,
      request: buildRequest(),
      scope: 'media',
    });

    expect(claimArtifactsImportMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      status: 'skipped',
      callRecordingId: 'call-recording-1',
      scope: 'media',
      reason: 'no matching call recording',
    });
  });
});
