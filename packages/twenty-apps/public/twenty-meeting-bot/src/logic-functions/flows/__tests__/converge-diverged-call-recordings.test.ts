import { type CoreApiClient } from 'twenty-client-sdk/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { convergeDivergedCallRecordings } from 'src/logic-functions/flows/converge-diverged-call-recordings.util';

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

const NOW = new Date('2026-06-10T12:00:00.000Z');

type CallRecordingNode = Record<string, unknown>;

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

const buildClient = (callRecordingNodes: CallRecordingNode[]) =>
  new FakeCoreApiClient(callRecordingNodes);

const buildStuckRecordingNode = (
  overrides: CallRecordingNode = {},
): CallRecordingNode => ({
  id: 'call-recording-1',
  status: 'RECORDING',
  startedAt: null,
  endedAt: null,
  externalBotId: 'recall-bot-1',
  externalRecordingId: null,
  transcript: null,
  audio: null,
  video: null,
  createdAt: '2026-06-09T12:00:00.000Z',
  calendarEvent: {
    startsAt: '2026-06-09T12:00:00.000Z',
    endsAt: '2026-06-09T13:00:00.000Z',
  },
  ...overrides,
});

describe('convergeDivergedCallRecordings', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    getRecallBotMock.mockReset();
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

  it('heals a stuck RECORDING record from the Recall bot state', async () => {
    getRecallBotMock.mockResolvedValue({
      ok: true,
      bot: {
        status_changes: [
          { code: 'in_call_recording', created_at: '2026-06-09T13:02:30.000Z' },
          { code: 'call_ended', created_at: '2026-06-09T14:00:30.000Z' },
          { code: 'done', created_at: '2026-06-09T14:05:00.000Z' },
        ],
        recordings: [
          {
            id: 'recall-recording-1',
            started_at: '2026-06-09T13:02:00.000Z',
            completed_at: '2026-06-09T14:00:00.000Z',
          },
        ],
      },
    });
    const client = buildClient([buildStuckRecordingNode()]);

    const result = await convergeDivergedCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(getRecallBotMock).toHaveBeenCalledWith({
      externalBotId: 'recall-bot-1',
    });
    expect(ingestCallRecordingMediaMock).toHaveBeenCalledWith({
      callRecordingId: 'call-recording-1',
      externalRecordingId: 'recall-recording-1',
      hasAudio: false,
      hasVideo: false,
    });
    expect(listRecallTranscriptsMock).toHaveBeenCalledWith({
      externalRecordingId: 'recall-recording-1',
    });
    expect(createAsyncRecallTranscriptMock).toHaveBeenCalledWith({
      externalRecordingId: 'recall-recording-1',
      callRecordingId: 'call-recording-1',
    });
    expect(client.mutations).toEqual([
      expect.objectContaining({
        id: 'call-recording-1',
        data: expect.objectContaining({
          status: 'PROCESSING',
          startedAt: '2026-06-09T13:02:00.000Z',
          endedAt: '2026-06-09T14:00:00.000Z',
          externalRecordingId: 'recall-recording-1',
        }),
      }),
    ]);
    expect(chargeCompletedCallRecordingMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      candidateCount: 1,
      updatedCallRecordingIds: ['call-recording-1'],
      markedFailedCallRecordingIds: [],
      requestedTranscriptCallRecordingIds: ['call-recording-1'],
      unconvergeableCallRecordingIds: [],
      skippedNotStartedCallRecordingIds: [],
    });
  });

  it('marks FAILED when Recall is done but has no recording artifact path', async () => {
    getRecallBotMock.mockResolvedValue({
      ok: true,
      bot: {
        status_changes: [
          { code: 'done', created_at: '2026-06-09T14:05:00.000Z' },
        ],
        recordings: [],
      },
    });
    const client = buildClient([buildStuckRecordingNode()]);

    const result = await convergeDivergedCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(listRecallTranscriptsMock).not.toHaveBeenCalled();
    expect(ingestCallRecordingMediaMock).not.toHaveBeenCalled();
    expect(client.mutations).toEqual([
      {
        id: 'call-recording-1',
        data: {
          status: 'FAILED',
          meetingBotFailureReason: 'recording_artifacts_unavailable',
        },
      },
    ]);
    expect(result.updatedCallRecordingIds).toEqual(['call-recording-1']);
  });

  it('completes and charges when convergence lands the last artifact', async () => {
    getRecallBotMock.mockResolvedValue({
      ok: true,
      bot: {
        status_changes: [
          { code: 'done', created_at: '2026-06-09T14:05:00.000Z' },
        ],
        recordings: [
          {
            id: 'recall-recording-1',
            started_at: '2026-06-09T13:02:00.000Z',
            completed_at: '2026-06-09T14:00:00.000Z',
          },
        ],
      },
    });
    ingestCallRecordingMediaMock.mockResolvedValue({
      audio: [{ fileId: 'file-audio-1', label: 'audio.mp3' }],
      video: [{ fileId: 'file-video-1', label: 'video.mp4' }],
    });
    const client = buildClient([
      buildStuckRecordingNode({
        status: 'PROCESSING',
        startedAt: '2026-06-09T13:02:00.000Z',
        endedAt: '2026-06-09T14:00:00.000Z',
        externalRecordingId: 'recall-recording-1',
        transcript: [{ participant: { id: 1 }, words: [] }],
      }),
    ]);

    const result = await convergeDivergedCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(createAsyncRecallTranscriptMock).not.toHaveBeenCalled();
    expect(listRecallTranscriptsMock).not.toHaveBeenCalled();
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
      startedAt: '2026-06-09T13:02:00.000Z',
      endedAt: '2026-06-09T14:00:00.000Z',
    });
    expect(result).toEqual({
      candidateCount: 1,
      updatedCallRecordingIds: ['call-recording-1'],
      markedFailedCallRecordingIds: [],
      requestedTranscriptCallRecordingIds: [],
      unconvergeableCallRecordingIds: [],
      skippedNotStartedCallRecordingIds: [],
    });
  });

  it('skips records whose meeting has not started yet', async () => {
    const client = buildClient([
      buildStuckRecordingNode({
        calendarEvent: {
          startsAt: '2026-06-10T12:30:00.000Z',
          endsAt: '2026-06-10T13:30:00.000Z',
        },
      }),
    ]);

    const result = await convergeDivergedCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(getRecallBotMock).not.toHaveBeenCalled();
    expect(client.mutations).toEqual([]);
    expect(result.skippedNotStartedCallRecordingIds).toEqual([
      'call-recording-1',
    ]);
  });

  it('converges a meeting that ended early while its scheduled end is still in the future', async () => {
    getRecallBotMock.mockResolvedValue({
      ok: true,
      bot: {
        status_changes: [
          { code: 'done', created_at: '2026-06-10T11:30:00.000Z' },
        ],
        recordings: [
          {
            id: 'recall-recording-1',
            started_at: '2026-06-10T11:05:00.000Z',
            completed_at: '2026-06-10T11:25:00.000Z',
          },
        ],
      },
    });
    const client = buildClient([
      buildStuckRecordingNode({
        calendarEvent: {
          startsAt: '2026-06-10T11:00:00.000Z',
          endsAt: '2026-06-10T13:00:00.000Z',
        },
      }),
    ]);

    const result = await convergeDivergedCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(getRecallBotMock).toHaveBeenCalledWith({
      externalBotId: 'recall-bot-1',
    });
    expect(result.updatedCallRecordingIds).toEqual(['call-recording-1']);
    expect(result.skippedNotStartedCallRecordingIds).toEqual([]);
  });

  it('marks FAILED without clearing the bot id when Recall returns 404', async () => {
    getRecallBotMock.mockResolvedValue({
      ok: false,
      status: 404,
      errorMessage: 'Recall API responded with HTTP 404',
    });
    const client = buildClient([buildStuckRecordingNode()]);

    const result = await convergeDivergedCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(client.mutations).toEqual([
      {
        id: 'call-recording-1',
        data: {
          status: 'FAILED',
          meetingBotFailureReason: 'recall_bot_not_found',
        },
      },
    ]);
    expect(result.markedFailedCallRecordingIds).toEqual(['call-recording-1']);
    expect(console.warn).toHaveBeenCalled();
  });

  it('does not downgrade a COMPLETED record when its bot 404s', async () => {
    getRecallBotMock.mockResolvedValue({
      ok: false,
      status: 404,
      errorMessage: 'Recall API responded with HTTP 404',
    });
    const client = buildClient([
      buildStuckRecordingNode({
        status: 'COMPLETED',
        startedAt: '2026-06-09T13:02:00.000Z',
        transcript: [{ participant: { id: 1 }, words: [] }],
      }),
    ]);

    const result = await convergeDivergedCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(client.mutations).toEqual([]);
    expect(result.unconvergeableCallRecordingIds).toEqual(['call-recording-1']);
  });

  it('logs candidates whose meeting ended before the lookback bound instead of converging them', async () => {
    const client = buildClient([
      buildStuckRecordingNode({
        calendarEvent: { endsAt: '2026-06-01T13:00:00.000Z' },
      }),
    ]);

    const result = await convergeDivergedCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(getRecallBotMock).not.toHaveBeenCalled();
    expect(client.mutations).toEqual([]);
    expect(result.unconvergeableCallRecordingIds).toEqual(['call-recording-1']);
    expect(console.warn).toHaveBeenCalled();
  });

  it('converges candidates created long before a recently ended meeting', async () => {
    getRecallBotMock.mockResolvedValue({
      ok: true,
      bot: {
        status_changes: [
          { code: 'in_call_recording', created_at: '2026-06-09T13:02:00.000Z' },
        ],
      },
    });
    const client = buildClient([
      buildStuckRecordingNode({
        createdAt: '2026-06-01T12:00:00.000Z',
        startedAt: '2026-06-09T13:02:00.000Z',
      }),
    ]);

    const result = await convergeDivergedCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(getRecallBotMock).toHaveBeenCalledWith({
      externalBotId: 'recall-bot-1',
    });
    expect(result.unconvergeableCallRecordingIds).toEqual([]);
  });

  it('applies the downgrade guard to pulled statuses while still filling timestamps', async () => {
    getRecallBotMock.mockResolvedValue({
      ok: true,
      bot: {
        status_changes: [
          { code: 'in_call_recording', created_at: '2026-06-09T13:02:00.000Z' },
        ],
        recordings: [
          { id: 'recall-recording-1', started_at: '2026-06-09T13:02:00.000Z' },
        ],
      },
    });
    const client = buildClient([
      buildStuckRecordingNode({ status: 'PROCESSING' }),
    ]);

    await convergeDivergedCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(client.mutations).toEqual([
      {
        id: 'call-recording-1',
        data: {
          startedAt: '2026-06-09T13:02:00.000Z',
          externalRecordingId: 'recall-recording-1',
        },
      },
    ]);
  });

  it('requests a transcript for a COMPLETED candidate that has none', async () => {
    getRecallBotMock.mockResolvedValue({
      ok: true,
      bot: {
        status_changes: [
          { code: 'done', created_at: '2026-06-09T14:05:00.000Z' },
        ],
        recordings: [
          {
            id: 'recall-recording-1',
            started_at: '2026-06-09T13:02:00.000Z',
            completed_at: '2026-06-09T14:00:00.000Z',
          },
        ],
      },
    });
    const client = buildClient([
      buildStuckRecordingNode({
        status: 'COMPLETED',
        startedAt: '2026-06-09T13:02:00.000Z',
        externalRecordingId: 'recall-recording-1',
      }),
    ]);

    const result = await convergeDivergedCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(createAsyncRecallTranscriptMock).toHaveBeenCalledTimes(1);
    expect(createAsyncRecallTranscriptMock).toHaveBeenCalledWith({
      externalRecordingId: 'recall-recording-1',
      callRecordingId: 'call-recording-1',
    });
    expect(client.mutations).toEqual([
      {
        id: 'call-recording-1',
        data: {
          endedAt: '2026-06-09T14:00:00.000Z',
          transcript: {
            recallTranscriptId: 'recall-transcript-1',
            status: 'PENDING',
            requestedAt: NOW.toISOString(),
          },
        },
      },
    ]);
    expect(result.requestedTranscriptCallRecordingIds).toEqual([
      'call-recording-1',
    ]);
  });

  it('does not create a duplicate transcript when Recall already has one processing', async () => {
    getRecallBotMock.mockResolvedValue({
      ok: true,
      bot: {
        status_changes: [
          { code: 'done', created_at: '2026-06-09T14:05:00.000Z' },
        ],
        recordings: [
          {
            id: 'recall-recording-1',
            started_at: '2026-06-09T13:02:00.000Z',
            completed_at: '2026-06-09T14:00:00.000Z',
          },
        ],
      },
    });
    listRecallTranscriptsMock.mockResolvedValue({
      ok: true,
      transcripts: [
        {
          id: 'recall-transcript-1',
          statusCode: 'processing',
          statusSubCode: undefined,
        },
      ],
    });
    const client = buildClient([buildStuckRecordingNode()]);

    const result = await convergeDivergedCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(createAsyncRecallTranscriptMock).not.toHaveBeenCalled();
    expect(downloadTranscriptMock).not.toHaveBeenCalled();
    expect(client.mutations).toEqual([
      {
        id: 'call-recording-1',
        data: {
          status: 'PROCESSING',
          startedAt: '2026-06-09T13:02:00.000Z',
          endedAt: '2026-06-09T14:00:00.000Z',
          externalRecordingId: 'recall-recording-1',
        },
      },
    ]);
    expect(result.requestedTranscriptCallRecordingIds).toEqual([]);
  });

  it('fills a completed Recall transcript artifact during convergence', async () => {
    const transcriptContent = [
      {
        participant: { id: 1, name: 'Ada' },
        words: [{ text: 'hello', start_timestamp: 1, end_timestamp: 2 }],
      },
    ];

    getRecallBotMock.mockResolvedValue({
      ok: true,
      bot: {
        status_changes: [
          { code: 'done', created_at: '2026-06-09T14:05:00.000Z' },
        ],
        recordings: [
          {
            id: 'recall-recording-1',
            started_at: '2026-06-09T13:02:00.000Z',
            completed_at: '2026-06-09T14:00:00.000Z',
          },
        ],
      },
    });
    listRecallTranscriptsMock.mockResolvedValue({
      ok: true,
      transcripts: [
        {
          id: 'recall-transcript-1',
          statusCode: 'done',
          statusSubCode: undefined,
        },
      ],
    });
    downloadTranscriptMock.mockResolvedValue({
      outcome: 'filled',
      content: transcriptContent,
    });
    const client = buildClient([
      buildStuckRecordingNode({
        status: 'PROCESSING',
        startedAt: '2026-06-09T13:02:00.000Z',
        endedAt: '2026-06-09T14:00:00.000Z',
        externalRecordingId: 'recall-recording-1',
        transcript: {
          recallTranscriptId: 'legacy-pending-transcript',
          status: 'PENDING',
          requestedAt: '2026-06-09T14:05:30.000Z',
        },
        audio: [{ fileId: 'file-audio-1', label: 'audio.mp3' }],
        video: [{ fileId: 'file-video-1', label: 'video.mp4' }],
      }),
    ]);

    const result = await convergeDivergedCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(createAsyncRecallTranscriptMock).not.toHaveBeenCalled();
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
    expect(chargeCompletedCallRecordingMock).toHaveBeenCalledWith({
      callRecordingId: 'call-recording-1',
      startedAt: '2026-06-09T13:02:00.000Z',
      endedAt: '2026-06-09T14:00:00.000Z',
    });
    expect(result.requestedTranscriptCallRecordingIds).toEqual([]);
  });

  it('marks the call recording failed when Recall has a failed transcript artifact', async () => {
    getRecallBotMock.mockResolvedValue({
      ok: true,
      bot: {
        status_changes: [
          { code: 'done', created_at: '2026-06-09T14:05:00.000Z' },
        ],
        recordings: [
          {
            id: 'recall-recording-1',
            started_at: '2026-06-09T13:02:00.000Z',
            completed_at: '2026-06-09T14:00:00.000Z',
          },
        ],
      },
    });
    listRecallTranscriptsMock.mockResolvedValue({
      ok: true,
      transcripts: [
        {
          id: 'recall-transcript-1',
          statusCode: 'failed',
          statusSubCode: 'audio_missing',
        },
      ],
    });
    const client = buildClient([
      buildStuckRecordingNode({
        status: 'PROCESSING',
        startedAt: '2026-06-09T13:02:00.000Z',
        endedAt: '2026-06-09T14:00:00.000Z',
        externalRecordingId: 'recall-recording-1',
      }),
    ]);

    const result = await convergeDivergedCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(createAsyncRecallTranscriptMock).not.toHaveBeenCalled();
    expect(downloadTranscriptMock).not.toHaveBeenCalled();
    expect(client.mutations).toEqual([
      {
        id: 'call-recording-1',
        data: {
          status: 'FAILED',
          transcript: {
            recallTranscriptId: 'recall-transcript-1',
            status: 'FAILED',
            subCode: 'audio_missing',
          },
          meetingBotFailureReason: 'transcript_failed:audio_missing',
        },
      },
    ]);
    expect(result.requestedTranscriptCallRecordingIds).toEqual([]);
  });

  it('does not mutate a record the bot state agrees with', async () => {
    getRecallBotMock.mockResolvedValue({
      ok: true,
      bot: {
        status_changes: [
          { code: 'in_call_recording', created_at: '2026-06-09T13:02:00.000Z' },
        ],
      },
    });
    const client = buildClient([
      buildStuckRecordingNode({ startedAt: '2026-06-09T13:02:00.000Z' }),
    ]);

    const result = await convergeDivergedCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(client.mutations).toEqual([]);
    expect(result.updatedCallRecordingIds).toEqual([]);
  });
});
