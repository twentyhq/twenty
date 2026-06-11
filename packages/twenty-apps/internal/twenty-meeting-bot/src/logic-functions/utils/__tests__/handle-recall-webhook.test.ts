import { type CoreApiClient } from 'twenty-client-sdk/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { handleRecallWebhook } from 'src/logic-functions/utils/handle-recall-webhook.util';

const getRecallBotMock = vi.hoisted(() => vi.fn());
const createAsyncRecallTranscriptMock = vi.hoisted(() => vi.fn());
const retrieveRecallTranscriptMock = vi.hoisted(() => vi.fn());

vi.mock('src/logic-functions/utils/recall-bot-api.util', () => ({
  getRecallBot: getRecallBotMock,
  createAsyncRecallTranscript: createAsyncRecallTranscriptMock,
  retrieveRecallTranscript: retrieveRecallTranscriptMock,
}));

type CallRecordingNode = {
  id: string;
  status?: string | null;
  externalBotId?: string | null;
  externalRecordingId?: string | null;
  startedAt?: string | null;
  endedAt?: string | null;
  transcript?: unknown;
};

class FakeCoreApiClient {
  callRecordings: CallRecordingNode[];
  mutations: Array<{ id: string; data: Record<string, unknown> }> = [];

  constructor(callRecordings: CallRecordingNode[]) {
    this.callRecordings = callRecordings;
  }

  async query(query: any): Promise<any> {
    if (query.callRecordings !== undefined) {
      const filter = query.callRecordings.__args.filter;

      return {
        callRecordings: {
          edges: this.filterCallRecordings(filter).map((callRecording) => ({
            node: callRecording,
          })),
        },
      };
    }

    throw new Error(`Unhandled query: ${JSON.stringify(query)}`);
  }

  async mutation(mutation: any): Promise<any> {
    if (mutation.updateCallRecording !== undefined) {
      const { id, data } = mutation.updateCallRecording.__args;

      this.mutations.push({ id, data });

      return {
        updateCallRecording: {
          id,
        },
      };
    }

    throw new Error(`Unhandled mutation: ${JSON.stringify(mutation)}`);
  }

  private filterCallRecordings(filter: any): CallRecordingNode[] {
    if (filter.id?.eq !== undefined) {
      return this.callRecordings.filter(
        (callRecording) => callRecording.id === filter.id.eq,
      );
    }

    if (filter.externalBotId?.eq !== undefined) {
      return this.callRecordings.filter(
        (callRecording) =>
          callRecording.externalBotId === filter.externalBotId.eq,
      );
    }

    throw new Error(
      `Unhandled call recording filter: ${JSON.stringify(filter)}`,
    );
  }
}

describe('handleRecallWebhook', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    getRecallBotMock.mockReset();
    getRecallBotMock.mockResolvedValue({
      ok: false,
      status: null,
      errorMessage: 'bot fetch disabled in test',
    });
    createAsyncRecallTranscriptMock.mockReset();
    createAsyncRecallTranscriptMock.mockResolvedValue({
      ok: false,
      status: null,
      errorMessage: 'transcript request disabled in test',
    });
    retrieveRecallTranscriptMock.mockReset();
    retrieveRecallTranscriptMock.mockResolvedValue({
      ok: false,
      status: null,
      errorMessage: 'transcript retrieval disabled in test',
    });
  });

  it('updates a call recording from bot metadata on status change events', async () => {
    const client = new FakeCoreApiClient([
      {
        id: 'call-recording-1',
        status: 'JOINING',
        externalBotId: 'recall-bot-1',
      },
    ]);

    const result = await handleRecallWebhook({
      client: client as unknown as CoreApiClient,
      body: {
        event: 'bot.status_change',
        data: {
          bot: {
            id: 'recall-bot-1',
            metadata: {
              twentyCallRecordingId: 'call-recording-1',
            },
          },
          status: {
            code: 'in_call_recording',
          },
        },
      },
    });

    expect(result).toEqual({
      status: 'updated',
      event: 'bot.status_change',
      callRecordingId: 'call-recording-1',
      callRecordingStatus: 'RECORDING',
    });
    expect(client.mutations).toEqual([
      {
        id: 'call-recording-1',
        data: {
          status: 'RECORDING',
          externalBotId: 'recall-bot-1',
        },
      },
    ]);
  });

  it('reads bot metadata nested under data when a top-level bot has none', async () => {
    const client = new FakeCoreApiClient([
      {
        id: 'call-recording-1',
        status: 'JOINING',
        externalBotId: 'recall-bot-1',
      },
    ]);

    const result = await handleRecallWebhook({
      client: client as unknown as CoreApiClient,
      body: {
        event: 'bot.status_change',
        bot: {
          id: 'recall-bot-1',
        },
        data: {
          bot: {
            id: 'recall-bot-1',
            metadata: {
              twentyCallRecordingId: 'call-recording-1',
            },
          },
          status: {
            code: 'in_call_recording',
          },
        },
      },
    });

    expect(result).toEqual({
      status: 'updated',
      event: 'bot.status_change',
      callRecordingId: 'call-recording-1',
      callRecordingStatus: 'RECORDING',
    });
  });

  it('matches by metadata id when the recording carries no external bot id', async () => {
    const client = new FakeCoreApiClient([
      {
        id: 'call-recording-1',
        status: 'SCHEDULED',
        externalBotId: null,
      },
    ]);

    const result = await handleRecallWebhook({
      client: client as unknown as CoreApiClient,
      body: {
        event: 'bot.status_change',
        data: {
          bot: {
            id: 'recall-bot-1',
            metadata: {
              twentyCallRecordingId: 'call-recording-1',
            },
          },
          status: {
            code: 'in_call_recording',
          },
        },
      },
    });

    expect(result).toEqual({
      status: 'updated',
      event: 'bot.status_change',
      callRecordingId: 'call-recording-1',
      callRecordingStatus: 'RECORDING',
    });
    expect(client.mutations).toEqual([
      {
        id: 'call-recording-1',
        data: {
          status: 'RECORDING',
          externalBotId: 'recall-bot-1',
        },
      },
    ]);
  });

  it('prefers the metadata id over a different recording carrying the bot id', async () => {
    const client = new FakeCoreApiClient([
      {
        id: 'call-recording-stale',
        status: 'SCHEDULED',
        externalBotId: 'recall-bot-1',
      },
      {
        id: 'call-recording-current',
        status: 'SCHEDULED',
        externalBotId: null,
      },
    ]);

    const result = await handleRecallWebhook({
      client: client as unknown as CoreApiClient,
      body: {
        event: 'bot.status_change',
        data: {
          bot: {
            id: 'recall-bot-1',
            metadata: {
              twentyCallRecordingId: 'call-recording-current',
            },
          },
          status: {
            code: 'in_call_recording',
          },
        },
      },
    });

    expect(result).toEqual({
      status: 'updated',
      event: 'bot.status_change',
      callRecordingId: 'call-recording-current',
      callRecordingStatus: 'RECORDING',
    });
    expect(client.mutations).toEqual([
      {
        id: 'call-recording-current',
        data: {
          status: 'RECORDING',
          externalBotId: 'recall-bot-1',
        },
      },
    ]);
  });

  it('falls back to external bot id matching when metadata is absent', async () => {
    const client = new FakeCoreApiClient([
      {
        id: 'call-recording-1',
        status: 'PROCESSING',
        externalBotId: 'recall-bot-1',
      },
    ]);

    const result = await handleRecallWebhook({
      client: client as unknown as CoreApiClient,
      body: {
        event: 'recording.done',
        data: {
          bot_id: 'recall-bot-1',
          recording: {
            id: 'recall-recording-1',
          },
        },
      },
    });

    expect(result).toEqual({
      status: 'updated',
      event: 'recording.done',
      callRecordingId: 'call-recording-1',
      callRecordingStatus: 'COMPLETED',
    });
    expect(client.mutations).toEqual([
      {
        id: 'call-recording-1',
        data: {
          status: 'COMPLETED',
          externalBotId: 'recall-bot-1',
          externalRecordingId: 'recall-recording-1',
        },
      },
    ]);
  });

  it('fills startedAt from the status timestamp when the bot starts recording', async () => {
    const client = new FakeCoreApiClient([
      {
        id: 'call-recording-1',
        status: 'JOINING',
        externalBotId: 'recall-bot-1',
      },
    ]);

    const result = await handleRecallWebhook({
      client: client as unknown as CoreApiClient,
      body: {
        event: 'bot.status_change',
        data: {
          bot: {
            id: 'recall-bot-1',
            metadata: {
              twentyCallRecordingId: 'call-recording-1',
            },
          },
          status: {
            code: 'in_call_recording',
            created_at: '2026-01-01T13:02:00.000Z',
          },
        },
      },
    });

    expect(result).toEqual({
      status: 'updated',
      event: 'bot.status_change',
      callRecordingId: 'call-recording-1',
      callRecordingStatus: 'RECORDING',
    });
    expect(client.mutations).toEqual([
      {
        id: 'call-recording-1',
        data: {
          status: 'RECORDING',
          externalBotId: 'recall-bot-1',
          startedAt: '2026-01-01T13:02:00.000Z',
        },
      },
    ]);
  });

  it('fills endedAt from the status timestamp when the recording is done', async () => {
    const client = new FakeCoreApiClient([
      {
        id: 'call-recording-1',
        status: 'PROCESSING',
        externalBotId: 'recall-bot-1',
        startedAt: '2026-01-01T13:02:00.000Z',
      },
    ]);

    const result = await handleRecallWebhook({
      client: client as unknown as CoreApiClient,
      body: {
        event: 'bot.status_change',
        data: {
          bot: {
            id: 'recall-bot-1',
            metadata: {
              twentyCallRecordingId: 'call-recording-1',
            },
          },
          status: {
            code: 'done',
            created_at: '2026-01-01T14:05:00.000Z',
          },
        },
      },
    });

    expect(result).toEqual({
      status: 'updated',
      event: 'bot.status_change',
      callRecordingId: 'call-recording-1',
      callRecordingStatus: 'COMPLETED',
    });
    expect(client.mutations).toEqual([
      {
        id: 'call-recording-1',
        data: {
          status: 'COMPLETED',
          externalBotId: 'recall-bot-1',
          endedAt: '2026-01-01T14:05:00.000Z',
        },
      },
    ]);
  });

  it('normalizes microsecond-precision Recall timestamps before writing them', async () => {
    const client = new FakeCoreApiClient([
      {
        id: 'call-recording-1',
        status: 'PROCESSING',
        externalBotId: 'recall-bot-1',
        startedAt: '2026-06-10T11:02:00.000Z',
      },
    ]);

    await handleRecallWebhook({
      client: client as unknown as CoreApiClient,
      body: {
        event: 'bot.status_change',
        data: {
          bot: {
            id: 'recall-bot-1',
            metadata: {
              twentyCallRecordingId: 'call-recording-1',
            },
          },
          status: {
            code: 'done',
            created_at: '2026-06-10T12:17:28.281597+00:00',
          },
        },
      },
    });

    expect(client.mutations).toEqual([
      {
        id: 'call-recording-1',
        data: {
          status: 'COMPLETED',
          externalBotId: 'recall-bot-1',
          endedAt: '2026-06-10T12:17:28.281Z',
        },
      },
    ]);
  });

  it('does not overwrite an already-set startedAt on a redelivered recording event', async () => {
    const client = new FakeCoreApiClient([
      {
        id: 'call-recording-1',
        status: 'RECORDING',
        externalBotId: 'recall-bot-1',
        startedAt: '2026-01-01T13:02:00.000Z',
      },
    ]);

    await handleRecallWebhook({
      client: client as unknown as CoreApiClient,
      body: {
        event: 'bot.status_change',
        data: {
          bot: {
            id: 'recall-bot-1',
            metadata: {
              twentyCallRecordingId: 'call-recording-1',
            },
          },
          status: {
            code: 'in_call_recording',
            created_at: '2026-01-01T13:09:00.000Z',
          },
        },
      },
    });

    expect(client.mutations).toEqual([
      {
        id: 'call-recording-1',
        data: {
          status: 'RECORDING',
          externalBotId: 'recall-bot-1',
        },
      },
    ]);
  });

  it('does not overwrite an already-set endedAt on a redelivered done event', async () => {
    const client = new FakeCoreApiClient([
      {
        id: 'call-recording-1',
        status: 'COMPLETED',
        externalBotId: 'recall-bot-1',
        startedAt: '2026-01-01T13:02:00.000Z',
        endedAt: '2026-01-01T14:05:00.000Z',
      },
    ]);

    await handleRecallWebhook({
      client: client as unknown as CoreApiClient,
      body: {
        event: 'bot.status_change',
        data: {
          bot: {
            id: 'recall-bot-1',
            metadata: {
              twentyCallRecordingId: 'call-recording-1',
            },
          },
          status: {
            code: 'done',
            created_at: '2026-01-01T14:11:00.000Z',
          },
        },
      },
    });

    expect(client.mutations).toEqual([
      {
        id: 'call-recording-1',
        data: {
          status: 'COMPLETED',
          externalBotId: 'recall-bot-1',
        },
      },
    ]);
  });

  it('skips out-of-order events that would move the status backwards', async () => {
    const client = new FakeCoreApiClient([
      {
        id: 'call-recording-1',
        status: 'COMPLETED',
        externalBotId: 'recall-bot-1',
      },
    ]);

    const result = await handleRecallWebhook({
      client: client as unknown as CoreApiClient,
      body: {
        event: 'bot.status_change',
        data: {
          bot: {
            id: 'recall-bot-1',
            metadata: {
              twentyCallRecordingId: 'call-recording-1',
            },
          },
          status: {
            code: 'in_call_recording',
          },
        },
      },
    });

    expect(result).toEqual({
      status: 'skipped',
      event: 'bot.status_change',
      reason: 'stale status event (COMPLETED -> RECORDING)',
    });
    expect(client.mutations).toEqual([]);
  });

  it('skips events whose metadata points at a missing call recording', async () => {
    const client = new FakeCoreApiClient([]);

    const result = await handleRecallWebhook({
      client: client as unknown as CoreApiClient,
      body: {
        event: 'bot.status_change',
        data: {
          bot: {
            metadata: {
              twentyCallRecordingId: 'call-recording-deleted',
            },
          },
          status: {
            code: 'in_call_recording',
          },
        },
      },
    });

    expect(result).toEqual({
      status: 'skipped',
      event: 'bot.status_change',
      reason: 'no matching call recording',
    });
    expect(client.mutations).toEqual([]);
  });

  it('skips unsupported events', async () => {
    const client = new FakeCoreApiClient([]);

    const result = await handleRecallWebhook({
      client: client as unknown as CoreApiClient,
      body: {
        event: 'participant_events.done',
        data: {},
      },
    });

    expect(result).toEqual({
      status: 'skipped',
      event: 'participant_events.done',
      reason: 'unsupported Recall event status participant_events.done',
    });
    expect(client.mutations).toEqual([]);
  });

  it('requests a transcript once when the recording first completes', async () => {
    createAsyncRecallTranscriptMock.mockResolvedValue({
      ok: true,
      transcriptId: 'recall-transcript-1',
    });
    const client = new FakeCoreApiClient([
      {
        id: 'call-recording-1',
        status: 'PROCESSING',
        externalBotId: 'recall-bot-1',
        transcript: null,
      },
    ]);

    await handleRecallWebhook({
      client: client as unknown as CoreApiClient,
      body: {
        event: 'recording.done',
        data: {
          bot_id: 'recall-bot-1',
          recording: {
            id: 'recall-recording-1',
          },
        },
      },
    });

    expect(createAsyncRecallTranscriptMock).toHaveBeenCalledTimes(1);
    expect(createAsyncRecallTranscriptMock).toHaveBeenCalledWith({
      externalRecordingId: 'recall-recording-1',
    });
    expect(client.mutations).toEqual([
      {
        id: 'call-recording-1',
        data: {
          status: 'COMPLETED',
          externalBotId: 'recall-bot-1',
          externalRecordingId: 'recall-recording-1',
          transcript: {
            recallTranscriptId: 'recall-transcript-1',
            status: 'PENDING',
            requestedAt: expect.any(String),
          },
        },
      },
    ]);
  });

  it('does not re-request a transcript on a redelivered done event', async () => {
    const client = new FakeCoreApiClient([
      {
        id: 'call-recording-1',
        status: 'COMPLETED',
        externalBotId: 'recall-bot-1',
        externalRecordingId: 'recall-recording-1',
        transcript: {
          recallTranscriptId: 'recall-transcript-1',
          status: 'PENDING',
          requestedAt: '2026-01-01T14:06:00.000Z',
        },
      },
    ]);

    await handleRecallWebhook({
      client: client as unknown as CoreApiClient,
      body: {
        event: 'recording.done',
        data: {
          bot_id: 'recall-bot-1',
          recording: {
            id: 'recall-recording-1',
          },
        },
      },
    });

    expect(createAsyncRecallTranscriptMock).not.toHaveBeenCalled();
    expect(client.mutations).toEqual([
      {
        id: 'call-recording-1',
        data: {
          status: 'COMPLETED',
          externalBotId: 'recall-bot-1',
          externalRecordingId: 'recall-recording-1',
        },
      },
    ]);
  });

  it('resolves the recording id from the bot when the payload and record lack one', async () => {
    getRecallBotMock.mockResolvedValue({
      ok: true,
      bot: {
        recordings: [{ id: 'recall-recording-9' }],
      },
    });
    createAsyncRecallTranscriptMock.mockResolvedValue({
      ok: true,
      transcriptId: 'recall-transcript-9',
    });
    const client = new FakeCoreApiClient([
      {
        id: 'call-recording-1',
        status: 'PROCESSING',
        externalBotId: 'recall-bot-1',
        transcript: null,
      },
    ]);

    await handleRecallWebhook({
      client: client as unknown as CoreApiClient,
      body: {
        event: 'bot.status_change',
        data: {
          bot: {
            id: 'recall-bot-1',
            metadata: {
              twentyCallRecordingId: 'call-recording-1',
            },
          },
          status: {
            code: 'done',
          },
        },
      },
    });

    expect(getRecallBotMock).toHaveBeenCalledWith({
      externalBotId: 'recall-bot-1',
    });
    expect(createAsyncRecallTranscriptMock).toHaveBeenCalledWith({
      externalRecordingId: 'recall-recording-9',
    });
    expect(client.mutations).toEqual([
      {
        id: 'call-recording-1',
        data: {
          status: 'COMPLETED',
          externalBotId: 'recall-bot-1',
          externalRecordingId: 'recall-recording-9',
          transcript: {
            recallTranscriptId: 'recall-transcript-9',
            status: 'PENDING',
            requestedAt: expect.any(String),
          },
        },
      },
    ]);
  });

  it('fills the transcript from the download URL on transcript.done', async () => {
    const transcriptContent = [
      {
        participant: { id: 1, name: 'Alice' },
        words: [{ text: 'hello', start_timestamp: { relative: 0.5 } }],
      },
    ];

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
        status: 'COMPLETED',
        externalBotId: 'recall-bot-1',
        transcript: {
          recallTranscriptId: 'recall-transcript-1',
          status: 'PENDING',
          requestedAt: '2026-01-01T14:06:00.000Z',
        },
      },
    ]);

    const result = await handleRecallWebhook({
      client: client as unknown as CoreApiClient,
      body: {
        event: 'transcript.done',
        data: {
          bot: {
            id: 'recall-bot-1',
            metadata: {
              twentyCallRecordingId: 'call-recording-1',
            },
          },
          transcript: {
            id: 'recall-transcript-1',
          },
          recording: {
            id: 'recall-recording-1',
          },
        },
      },
    });

    expect(result).toEqual({
      status: 'updated',
      event: 'transcript.done',
      callRecordingId: 'call-recording-1',
      transcriptOutcome: 'FILLED',
    });
    expect(retrieveRecallTranscriptMock).toHaveBeenCalledWith({
      transcriptId: 'recall-transcript-1',
    });
    expect(client.mutations).toEqual([
      {
        id: 'call-recording-1',
        data: {
          transcript: transcriptContent,
          externalRecordingId: 'recall-recording-1',
        },
      },
    ]);

    vi.unstubAllGlobals();
  });

  it('writes a FAILED marker on transcript.failed', async () => {
    const client = new FakeCoreApiClient([
      {
        id: 'call-recording-1',
        status: 'COMPLETED',
        externalBotId: 'recall-bot-1',
        externalRecordingId: 'recall-recording-1',
        transcript: {
          recallTranscriptId: 'recall-transcript-1',
          status: 'PENDING',
          requestedAt: '2026-01-01T14:06:00.000Z',
        },
      },
    ]);

    const result = await handleRecallWebhook({
      client: client as unknown as CoreApiClient,
      body: {
        event: 'transcript.failed',
        data: {
          bot: {
            id: 'recall-bot-1',
            metadata: {
              twentyCallRecordingId: 'call-recording-1',
            },
          },
          transcript: {
            id: 'recall-transcript-1',
          },
          status: {
            sub_code: 'transcription_failed',
          },
        },
      },
    });

    expect(result).toEqual({
      status: 'updated',
      event: 'transcript.failed',
      callRecordingId: 'call-recording-1',
      transcriptOutcome: 'FAILED',
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
    ]);
    expect(console.warn).toHaveBeenCalled();
  });

  it('does not clobber a downloaded transcript with a late transcript.failed', async () => {
    const client = new FakeCoreApiClient([
      {
        id: 'call-recording-1',
        status: 'COMPLETED',
        externalBotId: 'recall-bot-1',
        transcript: [{ participant: { id: 1 }, words: [] }],
      },
    ]);

    const result = await handleRecallWebhook({
      client: client as unknown as CoreApiClient,
      body: {
        event: 'transcript.failed',
        data: {
          bot: {
            id: 'recall-bot-1',
            metadata: {
              twentyCallRecordingId: 'call-recording-1',
            },
          },
          transcript: {
            id: 'recall-transcript-1',
          },
          status: {
            sub_code: 'transcription_failed',
          },
        },
      },
    });

    expect(result).toEqual({
      status: 'skipped',
      event: 'transcript.failed',
      reason: 'transcript already filled',
    });
    expect(client.mutations).toEqual([]);
  });
});
