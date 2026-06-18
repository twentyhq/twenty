import { type CoreApiClient } from 'twenty-client-sdk/core';
import { describe, expect, it } from 'vitest';

import { handleRecallWebhook } from 'src/logic-functions/flows/handle-recall-webhook.util';

type CallRecordingNode = {
  id: string;
  status?: string | null;
  externalBotId?: string | null;
  externalRecordingId?: string | null;
  startedAt?: string | null;
  endedAt?: string | null;
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
      callRecordingStatus: 'PROCESSING',
    });
    expect(client.mutations).toEqual([
      {
        id: 'call-recording-1',
        data: {
          status: 'PROCESSING',
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
      callRecordingStatus: 'PROCESSING',
    });
    expect(client.mutations).toEqual([
      {
        id: 'call-recording-1',
        data: {
          status: 'PROCESSING',
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
          status: 'PROCESSING',
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
        status: 'PROCESSING',
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
          status: 'PROCESSING',
          externalBotId: 'recall-bot-1',
        },
      },
    ]);
  });

  it('maps a fatal bot status to FAILED_UNKNOWN', async () => {
    const client = new FakeCoreApiClient([
      {
        id: 'call-recording-1',
        status: 'RECORDING',
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
            code: 'fatal',
          },
        },
      },
    });

    expect(result).toEqual({
      status: 'updated',
      event: 'bot.status_change',
      callRecordingId: 'call-recording-1',
      callRecordingStatus: 'FAILED_UNKNOWN',
    });
    expect(client.mutations).toEqual([
      {
        id: 'call-recording-1',
        data: {
          status: 'FAILED_UNKNOWN',
          externalBotId: 'recall-bot-1',
        },
      },
    ]);
  });

  it('skips a late done event once the recording is COMPLETED', async () => {
    const client = new FakeCoreApiClient([
      {
        id: 'call-recording-1',
        status: 'COMPLETED',
        externalBotId: 'recall-bot-1',
        startedAt: '2026-01-01T13:02:00.000Z',
        endedAt: '2026-01-01T14:05:00.000Z',
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
            created_at: '2026-01-01T14:11:00.000Z',
          },
        },
      },
    });

    expect(result).toEqual({
      status: 'skipped',
      event: 'bot.status_change',
      reason: 'stale status event (COMPLETED -> PROCESSING)',
    });
    expect(client.mutations).toEqual([]);
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
});
