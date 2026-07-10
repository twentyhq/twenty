import { type CoreApiClient } from 'twenty-client-sdk/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { reconcileDivergedCallRecordings } from 'src/logic-functions/flows/reconcile-diverged-call-recordings.util';

const getRecallBotMock = vi.hoisted(() => vi.fn());
const listScheduledRecallBotsMock = vi.hoisted(() => vi.fn());
const getCurrentWorkspaceIdMock = vi.hoisted(() => vi.fn());
const listRecallTranscriptsMock = vi.hoisted(() => vi.fn());
const createAsyncRecallTranscriptMock = vi.hoisted(() => vi.fn());
const downloadTranscriptMock = vi.hoisted(() => vi.fn());
const ingestCallRecordingMediaMock = vi.hoisted(() => vi.fn());
const chargeCompletedCallRecordingMock = vi.hoisted(() => vi.fn());

vi.mock('src/logic-functions/recall-api/get-recall-bot.util', () => ({
  getRecallBot: getRecallBotMock,
}));

vi.mock(
  'src/logic-functions/recall-api/list-scheduled-recall-bots.util',
  () => ({
    listScheduledRecallBots: listScheduledRecallBotsMock,
  }),
);

vi.mock('src/logic-functions/data/get-current-workspace-id.util', () => ({
  getCurrentWorkspaceId: getCurrentWorkspaceIdMock,
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

describe('reconcileDivergedCallRecordings', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    getRecallBotMock.mockReset();
    listScheduledRecallBotsMock.mockReset();
    listScheduledRecallBotsMock.mockResolvedValue({
      ok: true,
      bots: [],
    });
    getCurrentWorkspaceIdMock.mockReset();
    getCurrentWorkspaceIdMock.mockReturnValue(
      '123e4567-e89b-12d3-a456-426614174000',
    );
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
    chargeCompletedCallRecordingMock.mockResolvedValue('charged');
  });

  it('heals a stuck RECORDING record from the Recall bot state', async () => {
    getRecallBotMock.mockResolvedValue({
      ok: true,
      bot: {
        statusChanges: [
          { code: 'in_call_recording', createdAt: '2026-06-09T13:02:30.000Z' },
          { code: 'call_ended', createdAt: '2026-06-09T14:00:30.000Z' },
          { code: 'done', createdAt: '2026-06-09T14:05:00.000Z' },
        ],
        recordings: [
          {
            id: 'recall-recording-1',
            startedAt: '2026-06-09T13:02:00.000Z',
            completedAt: '2026-06-09T14:00:00.000Z',
          },
        ],
      },
    });
    const client = buildClient([buildStuckRecordingNode()]);

    const result = await reconcileDivergedCallRecordings({
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

  it('uses a listed Recall bot snapshot instead of fetching the bot by id', async () => {
    listScheduledRecallBotsMock.mockResolvedValue({
      ok: true,
      bots: [
        {
          id: 'recall-bot-1',
          metadata: {
            twentyWorkspaceId: '123e4567-e89b-12d3-a456-426614174000',
          },
          statusChanges: [
            {
              code: 'in_call_recording',
              createdAt: '2026-06-09T13:02:30.000Z',
            },
            { code: 'done', createdAt: '2026-06-09T14:05:00.000Z' },
          ],
          recordings: [
            {
              id: 'recall-recording-1',
              startedAt: '2026-06-09T13:02:00.000Z',
              completedAt: '2026-06-09T14:00:00.000Z',
            },
          ],
        },
      ],
    });
    const client = buildClient([buildStuckRecordingNode()]);

    const result = await reconcileDivergedCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(listScheduledRecallBotsMock).toHaveBeenCalledWith({
      joinAtAfter: '2026-06-02T12:00:00.000Z',
      joinAtBefore: '2026-06-10T13:00:00.000Z',
      metadata: {
        twentyWorkspaceId: '123e4567-e89b-12d3-a456-426614174000',
      },
    });
    expect(getRecallBotMock).not.toHaveBeenCalled();
    expect(result.updatedCallRecordingIds).toEqual(['call-recording-1']);
  });

  it('defers convergence without per-id fetches when the Recall bot list fails', async () => {
    listScheduledRecallBotsMock.mockResolvedValue({
      ok: false,
      status: 429,
      errorMessage: 'Recall API responded with HTTP 429',
    });
    const client = buildClient([buildStuckRecordingNode()]);

    const result = await reconcileDivergedCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(getRecallBotMock).not.toHaveBeenCalled();
    expect(client.mutations).toEqual([]);
    expect(result.updatedCallRecordingIds).toEqual([]);
    expect(console.warn).toHaveBeenCalled();
  });

  it('fails the row when the bot completed without ever recording instead of looping forever', async () => {
    getRecallBotMock.mockResolvedValue({
      ok: true,
      bot: {
        statusChanges: [
          { code: 'done', createdAt: '2026-06-09T14:05:00.000Z' },
        ],
        recordings: [],
      },
    });
    const client = buildClient([buildStuckRecordingNode()]);

    const result = await reconcileDivergedCallRecordings({
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
          callRecorderFailureReason: 'recording_artifacts_unavailable',
        },
      },
    ]);
    expect(result.updatedCallRecordingIds).toEqual(['call-recording-1']);
  });

  it('keeps the bot failure reason when a failed bot also has no recording', async () => {
    getRecallBotMock.mockResolvedValue({
      ok: true,
      bot: {
        statusChanges: [
          { code: 'done', createdAt: '2026-06-09T14:04:00.000Z' },
          { code: 'fatal', createdAt: '2026-06-09T14:05:00.000Z' },
        ],
        recordings: [],
      },
    });
    const client = buildClient([buildStuckRecordingNode()]);

    await reconcileDivergedCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(client.mutations).toEqual([
      {
        id: 'call-recording-1',
        data: {
          status: 'FAILED',
          callRecorderFailureReason: 'fatal',
        },
      },
    ]);
  });

  it('completes and charges when convergence lands the last artifact', async () => {
    getRecallBotMock.mockResolvedValue({
      ok: true,
      bot: {
        statusChanges: [
          { code: 'done', createdAt: '2026-06-09T14:05:00.000Z' },
        ],
        recordings: [
          {
            id: 'recall-recording-1',
            startedAt: '2026-06-09T13:02:00.000Z',
            completedAt: '2026-06-09T14:00:00.000Z',
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

    const result = await reconcileDivergedCallRecordings({
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

  it('completes and charges when the missing video is marked too large', async () => {
    getRecallBotMock.mockResolvedValue({
      ok: true,
      bot: {
        statusChanges: [
          { code: 'done', createdAt: '2026-06-09T14:05:00.000Z' },
        ],
        recordings: [
          {
            id: 'recall-recording-1',
            startedAt: '2026-06-09T13:02:00.000Z',
            completedAt: '2026-06-09T14:00:00.000Z',
          },
        ],
      },
    });
    ingestCallRecordingMediaMock.mockResolvedValue({
      audio: [{ fileId: 'file-audio-1', label: 'audio.mp3' }],
      callRecorderFailureReason: 'video_file_too_large',
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

    const result = await reconcileDivergedCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(client.mutations).toEqual([
      {
        id: 'call-recording-1',
        data: {
          audio: [{ fileId: 'file-audio-1', label: 'audio.mp3' }],
          callRecorderFailureReason: 'video_file_too_large',
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
    expect(result.updatedCallRecordingIds).toEqual(['call-recording-1']);
  });

  it('completes from a persisted size marker once the transcript lands', async () => {
    getRecallBotMock.mockResolvedValue({
      ok: true,
      bot: {
        statusChanges: [
          { code: 'done', createdAt: '2026-06-09T14:05:00.000Z' },
        ],
        recordings: [
          {
            id: 'recall-recording-1',
            startedAt: '2026-06-09T13:02:00.000Z',
            completedAt: '2026-06-09T14:00:00.000Z',
          },
        ],
      },
    });
    const client = buildClient([
      buildStuckRecordingNode({
        status: 'PROCESSING',
        startedAt: '2026-06-09T13:02:00.000Z',
        endedAt: '2026-06-09T14:00:00.000Z',
        externalRecordingId: 'recall-recording-1',
        callRecorderFailureReason: 'video_file_too_large',
        audio: [{ fileId: 'file-audio-1' }],
        transcript: [{ participant: { id: 1 }, words: [] }],
      }),
    ]);

    const result = await reconcileDivergedCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(ingestCallRecordingMediaMock).toHaveBeenCalledWith({
      callRecordingId: 'call-recording-1',
      externalRecordingId: 'recall-recording-1',
      hasAudio: true,
      hasVideo: false,
    });
    expect(client.mutations).toEqual([
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
    expect(result.updatedCallRecordingIds).toEqual(['call-recording-1']);
  });

  it('keeps the real failure reason over the size marker when the bot failed', async () => {
    getRecallBotMock.mockResolvedValue({
      ok: true,
      bot: {
        statusChanges: [
          { code: 'fatal', createdAt: '2026-06-09T14:05:00.000Z' },
        ],
        recordings: [
          {
            id: 'recall-recording-1',
            startedAt: '2026-06-09T13:02:00.000Z',
            completedAt: '2026-06-09T14:00:00.000Z',
          },
        ],
      },
    });
    ingestCallRecordingMediaMock.mockResolvedValue({
      audio: [{ fileId: 'file-audio-1', label: 'audio.mp3' }],
      callRecorderFailureReason: 'video_file_too_large',
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

    await reconcileDivergedCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(client.mutations).toEqual([
      {
        id: 'call-recording-1',
        data: {
          status: 'FAILED',
          callRecorderFailureReason: 'fatal',
          audio: [{ fileId: 'file-audio-1', label: 'audio.mp3' }],
        },
      },
    ]);
    expect(chargeCompletedCallRecordingMock).not.toHaveBeenCalled();
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

    const result = await reconcileDivergedCallRecordings({
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
        statusChanges: [
          { code: 'done', createdAt: '2026-06-10T11:30:00.000Z' },
        ],
        recordings: [
          {
            id: 'recall-recording-1',
            startedAt: '2026-06-10T11:05:00.000Z',
            completedAt: '2026-06-10T11:25:00.000Z',
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

    const result = await reconcileDivergedCallRecordings({
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

    const result = await reconcileDivergedCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(client.mutations).toEqual([
      {
        id: 'call-recording-1',
        data: {
          status: 'FAILED',
          callRecorderFailureReason: 'recall_bot_not_found',
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

    const result = await reconcileDivergedCallRecordings({
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

    const result = await reconcileDivergedCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(getRecallBotMock).not.toHaveBeenCalled();
    expect(client.mutations).toEqual([]);
    expect(result.unconvergeableCallRecordingIds).toEqual(['call-recording-1']);
    expect(console.warn).toHaveBeenCalled();
  });

  it('does not use old createdAt as the convergence bound when calendar data is missing', async () => {
    getRecallBotMock.mockResolvedValue({
      ok: true,
      bot: {
        statusChanges: [
          { code: 'in_call_recording', createdAt: '2026-06-09T13:02:00.000Z' },
        ],
        recordings: [],
      },
    });
    const client = buildClient([
      buildStuckRecordingNode({
        calendarEvent: null,
        createdAt: '2026-06-01T12:00:00.000Z',
        startedAt: '2026-06-09T13:02:00.000Z',
      }),
    ]);

    const result = await reconcileDivergedCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(getRecallBotMock).toHaveBeenCalledWith({
      externalBotId: 'recall-bot-1',
    });
    expect(result.unconvergeableCallRecordingIds).toEqual([]);
  });

  it('prunes an eventless candidate that never started once createdAt passes the bound', async () => {
    const client = buildClient([
      buildStuckRecordingNode({
        calendarEvent: null,
        createdAt: '2026-06-01T12:00:00.000Z',
      }),
    ]);

    const result = await reconcileDivergedCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(getRecallBotMock).not.toHaveBeenCalled();
    expect(client.mutations).toEqual([]);
    expect(result.unconvergeableCallRecordingIds).toEqual(['call-recording-1']);
  });

  it('rotates the capped per-id fallback window so the same tail is not always skipped', async () => {
    getRecallBotMock.mockResolvedValue({
      ok: false,
      status: 500,
      errorMessage: 'temporary outage',
    });
    const candidateNodes = Array.from({ length: 27 }, (_, index) =>
      buildStuckRecordingNode({
        id: `call-recording-${index + 1}`,
        externalBotId: `recall-bot-${index + 1}`,
        calendarEvent: null,
      }),
    );

    await reconcileDivergedCallRecordings({
      client: buildClient(candidateNodes) as unknown as CoreApiClient,
      now: new Date(0),
    });

    expect(
      getRecallBotMock.mock.calls.map(([request]) => request.externalBotId),
    ).toEqual(
      Array.from({ length: 25 }, (_, index) => `recall-bot-${index + 1}`),
    );

    getRecallBotMock.mockClear();

    await reconcileDivergedCallRecordings({
      client: buildClient(candidateNodes) as unknown as CoreApiClient,
      now: new Date(15 * 60 * 1000),
    });

    expect(
      getRecallBotMock.mock.calls.map(([request]) => request.externalBotId),
    ).toEqual(
      Array.from({ length: 25 }, (_, index) => `recall-bot-${index + 2}`),
    );
  });

  it('applies the downgrade guard to pulled statuses while still filling timestamps', async () => {
    getRecallBotMock.mockResolvedValue({
      ok: true,
      bot: {
        statusChanges: [
          { code: 'in_call_recording', createdAt: '2026-06-09T13:02:00.000Z' },
        ],
        recordings: [
          { id: 'recall-recording-1', startedAt: '2026-06-09T13:02:00.000Z' },
        ],
      },
    });
    const client = buildClient([
      buildStuckRecordingNode({ status: 'PROCESSING' }),
    ]);

    await reconcileDivergedCallRecordings({
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
        statusChanges: [
          { code: 'done', createdAt: '2026-06-09T14:05:00.000Z' },
        ],
        recordings: [
          {
            id: 'recall-recording-1',
            startedAt: '2026-06-09T13:02:00.000Z',
            completedAt: '2026-06-09T14:00:00.000Z',
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

    const result = await reconcileDivergedCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(createAsyncRecallTranscriptMock).toHaveBeenCalledTimes(1);
    expect(createAsyncRecallTranscriptMock).toHaveBeenCalledWith({
      externalRecordingId: 'recall-recording-1',
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
        statusChanges: [
          { code: 'done', createdAt: '2026-06-09T14:05:00.000Z' },
        ],
        recordings: [
          {
            id: 'recall-recording-1',
            startedAt: '2026-06-09T13:02:00.000Z',
            completedAt: '2026-06-09T14:00:00.000Z',
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

    const result = await reconcileDivergedCallRecordings({
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
        statusChanges: [
          { code: 'done', createdAt: '2026-06-09T14:05:00.000Z' },
        ],
        recordings: [
          {
            id: 'recall-recording-1',
            startedAt: '2026-06-09T13:02:00.000Z',
            completedAt: '2026-06-09T14:00:00.000Z',
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

    const result = await reconcileDivergedCallRecordings({
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
        statusChanges: [
          { code: 'done', createdAt: '2026-06-09T14:05:00.000Z' },
        ],
        recordings: [
          {
            id: 'recall-recording-1',
            startedAt: '2026-06-09T13:02:00.000Z',
            completedAt: '2026-06-09T14:00:00.000Z',
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

    const result = await reconcileDivergedCallRecordings({
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
          callRecorderFailureReason: 'transcript_failed:audio_missing',
        },
      },
    ]);
    expect(result.requestedTranscriptCallRecordingIds).toEqual([]);
  });

  it('does not mutate a record the bot state agrees with', async () => {
    getRecallBotMock.mockResolvedValue({
      ok: true,
      bot: {
        statusChanges: [
          { code: 'in_call_recording', createdAt: '2026-06-09T13:02:00.000Z' },
        ],
        recordings: [],
      },
    });
    const client = buildClient([
      buildStuckRecordingNode({ startedAt: '2026-06-09T13:02:00.000Z' }),
    ]);

    const result = await reconcileDivergedCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(client.mutations).toEqual([]);
    expect(result.updatedCallRecordingIds).toEqual([]);
  });
});
