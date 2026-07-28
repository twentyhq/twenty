import { type CoreApiClient } from 'twenty-client-sdk/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { IMPORT_CALL_RECORDING_ARTIFACTS_ROUTE_PATH } from 'src/constants/import-call-recording-artifacts-route-path';
import { TWENTY_FUNCTIONS_URL_ENV_VAR_NAME } from 'src/constants/twenty-functions-url-env-var-name';
import { handleRecallWebhook } from 'src/logic-functions/flows/handle-recall-webhook.util';

const WORKSPACE_ID = '123e4567-e89b-12d3-a456-426614174000';
const FUNCTIONS_URL = 'https://functions.twenty.test';
const APP_ACCESS_TOKEN_ENV_VAR_NAME = 'TWENTY_APP_ACCESS_TOKEN';
const ENV_VAR_NAMES = [
  TWENTY_FUNCTIONS_URL_ENV_VAR_NAME,
  APP_ACCESS_TOKEN_ENV_VAR_NAME,
] as const;
const ORIGINAL_ENV_VALUES = ENV_VAR_NAMES.map(
  (envVarName) => [envVarName, process.env[envVarName]] as const,
);

const buildRecordingDoneWebhookBody = () => ({
  event: 'recording.done',
  data: {
    bot: {
      id: 'recall-bot-1',
      metadata: {
        twentyWorkspaceId: WORKSPACE_ID,
        twentyCallRecordingId: 'call-recording-1',
      },
    },
    recording: {
      id: 'recall-recording-1',
    },
  },
});

type CallRecordingNode = {
  id: string;
  status?: string | null;
  externalBotId?: string | null;
  externalRecordingId?: string | null;
  startedAt?: string | null;
  endedAt?: string | null;
  transcript?: unknown;
  audio?: unknown;
  video?: unknown;
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

  private filterCallRecordings(
    filter: Record<string, { eq: string }>,
  ): CallRecordingNode[] {
    if (filter.id !== undefined) {
      return this.callRecordings.filter(
        (callRecording) => callRecording.id === filter.id.eq,
      );
    }

    if (filter.externalBotId !== undefined) {
      return this.callRecordings.filter(
        (callRecording) =>
          callRecording.externalBotId === filter.externalBotId.eq,
      );
    }

    return [];
  }
}

describe('handleRecallWebhook', () => {
  const fetchMock = vi.fn();

  // The webhook handler's only HTTP side effect is the fire-and-forget POST to
  // the app's own artifact-import route; the stubbed fetch records it.
  const importRequestCalls = () =>
    fetchMock.mock.calls.filter(([url]) =>
      String(url).includes(IMPORT_CALL_RECORDING_ARTIFACTS_ROUTE_PATH),
    );

  const importRequestBodies = () =>
    importRequestCalls().map(([, init]) => JSON.parse(init.body));

  const nonImportRequestCalls = () =>
    fetchMock.mock.calls.filter(
      ([url]) =>
        !String(url).includes(IMPORT_CALL_RECORDING_ARTIFACTS_ROUTE_PATH),
    );

  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    process.env[TWENTY_FUNCTIONS_URL_ENV_VAR_NAME] = FUNCTIONS_URL;
    process.env[APP_ACCESS_TOKEN_ENV_VAR_NAME] = 'app-access-token';
    fetchMock.mockReset();
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: { get: () => null },
      json: async () => ({}),
      text: async () => '{}',
    });
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    ORIGINAL_ENV_VALUES.forEach(([envVarName, originalValue]) => {
      if (originalValue === undefined) {
        delete process.env[envVarName];
      } else {
        process.env[envVarName] = originalValue;
      }
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
              twentyWorkspaceId: WORKSPACE_ID,
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
              twentyWorkspaceId: WORKSPACE_ID,
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
              twentyWorkspaceId: WORKSPACE_ID,
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
              twentyWorkspaceId: WORKSPACE_ID,
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

  it('falls back to external bot id matching when call recording metadata is absent', async () => {
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
          bot: {
            id: 'recall-bot-1',
            metadata: {
              twentyWorkspaceId: WORKSPACE_ID,
            },
          },
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
              twentyWorkspaceId: WORKSPACE_ID,
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
              twentyWorkspaceId: WORKSPACE_ID,
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
              twentyWorkspaceId: WORKSPACE_ID,
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
              twentyWorkspaceId: WORKSPACE_ID,
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
        event: 'bot.status_change',
        data: {
          bot: {
            id: 'recall-bot-1',
            metadata: {
              twentyWorkspaceId: WORKSPACE_ID,
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
              twentyWorkspaceId: WORKSPACE_ID,
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
              twentyWorkspaceId: WORKSPACE_ID,
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
    expect(fetchMock).not.toHaveBeenCalled();
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
              twentyWorkspaceId: WORKSPACE_ID,
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

  it('queues artifact import when the recording first completes', async () => {
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
      body: buildRecordingDoneWebhookBody(),
    });

    expect(importRequestBodies()).toEqual([
      {
        callRecordingId: 'call-recording-1',
        requestedAt: expect.any(String),
      },
    ]);
    expect(nonImportRequestCalls()).toEqual([]);
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

  it('throws when the artifact import request fails so Svix redelivers', async () => {
    fetchMock.mockRejectedValue(new Error('own route unreachable'));
    const client = new FakeCoreApiClient([
      {
        id: 'call-recording-1',
        status: 'PROCESSING',
        externalBotId: 'recall-bot-1',
        transcript: null,
      },
    ]);

    await expect(
      handleRecallWebhook({
        client: client as unknown as CoreApiClient,
        body: buildRecordingDoneWebhookBody(),
      }),
    ).rejects.toThrow(
      'failed to request artifact import for call recording call-recording-1',
    );
  });

  it('queues redelivered done events without doing artifact work inline', async () => {
    const client = new FakeCoreApiClient([
      {
        id: 'call-recording-1',
        status: 'PROCESSING',
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
      body: buildRecordingDoneWebhookBody(),
    });

    expect(importRequestCalls()).toHaveLength(1);
    expect(nonImportRequestCalls()).toEqual([]);
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

  it('defers provider lookup when the payload and record lack a recording id', async () => {
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
              twentyWorkspaceId: WORKSPACE_ID,
              twentyCallRecordingId: 'call-recording-1',
            },
          },
          status: {
            code: 'done',
          },
        },
      },
    });

    expect(importRequestBodies()).toEqual([
      {
        callRecordingId: 'call-recording-1',
        requestedAt: expect.any(String),
      },
    ]);
    expect(nonImportRequestCalls()).toEqual([]);
    expect(client.mutations).toEqual([
      expect.objectContaining({
        id: 'call-recording-1',
        data: expect.objectContaining({
          status: 'PROCESSING',
          externalBotId: 'recall-bot-1',
        }),
      }),
    ]);
  });

  it('queues media import on recording.done instead of completing inline', async () => {
    const client = new FakeCoreApiClient([
      {
        id: 'call-recording-1',
        status: 'PROCESSING',
        externalBotId: 'recall-bot-1',
        externalRecordingId: 'recall-recording-1',
        startedAt: '2026-01-01T13:02:00.000Z',
        endedAt: '2026-01-01T14:05:00.000Z',
        transcript: [{ participant: { id: 1 }, words: [] }],
      },
    ]);

    await handleRecallWebhook({
      client: client as unknown as CoreApiClient,
      body: buildRecordingDoneWebhookBody(),
    });

    expect(nonImportRequestCalls()).toEqual([]);
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
    expect(importRequestCalls()).toHaveLength(1);
  });

  it('keeps the real failure reason on recording.failed and defers media work', async () => {
    const client = new FakeCoreApiClient([
      {
        id: 'call-recording-1',
        status: 'PROCESSING',
        externalBotId: 'recall-bot-1',
        externalRecordingId: 'recall-recording-1',
        startedAt: '2026-01-01T13:02:00.000Z',
        endedAt: '2026-01-01T14:05:00.000Z',
        transcript: [{ participant: { id: 1 }, words: [] }],
      },
    ]);

    const result = await handleRecallWebhook({
      client: client as unknown as CoreApiClient,
      body: {
        ...buildRecordingDoneWebhookBody(),
        event: 'recording.failed',
      },
    });

    expect(client.mutations).toEqual([
      {
        id: 'call-recording-1',
        data: {
          status: 'FAILED',
          externalBotId: 'recall-bot-1',
          externalRecordingId: 'recall-recording-1',
          callRecorderFailureReason: 'recording.failed',
        },
      },
    ]);
    expect(nonImportRequestCalls()).toEqual([]);
    expect(importRequestCalls()).toHaveLength(1);
    expect(result).toEqual({
      status: 'updated',
      event: 'recording.failed',
      callRecordingId: 'call-recording-1',
      callRecordingStatus: 'FAILED',
    });
  });

  it('queues transcript.done without downloading the transcript inline', async () => {
    const client = new FakeCoreApiClient([
      {
        id: 'call-recording-1',
        status: 'PROCESSING',
        externalBotId: 'recall-bot-1',
        externalRecordingId: 'recall-recording-1',
        startedAt: '2026-01-01T13:02:00.000Z',
        endedAt: '2026-01-01T14:05:00.000Z',
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
              twentyWorkspaceId: WORKSPACE_ID,
              twentyCallRecordingId: 'call-recording-1',
            },
          },
          transcript: {
            id: 'recall-transcript-1',
          },
        },
      },
    });

    expect(result).toEqual({
      status: 'queued',
      event: 'transcript.done',
      callRecordingId: 'call-recording-1',
    });
    expect(importRequestBodies()).toEqual([
      {
        callRecordingId: 'call-recording-1',
        requestedAt: expect.any(String),
      },
    ]);
    expect(nonImportRequestCalls()).toEqual([]);
    expect(client.mutations).toEqual([]);
  });

  it('queues transcript.failed without writing the failure marker inline', async () => {
    const client = new FakeCoreApiClient([
      {
        id: 'call-recording-1',
        status: 'PROCESSING',
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
              twentyWorkspaceId: WORKSPACE_ID,
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
      status: 'queued',
      event: 'transcript.failed',
      callRecordingId: 'call-recording-1',
    });
    expect(importRequestBodies()).toEqual([
      {
        callRecordingId: 'call-recording-1',
        requestedAt: expect.any(String),
      },
    ]);
    expect(client.mutations).toEqual([]);
  });

  it('classifies a call with no attendees as NOT_RECORDED without a recording end', async () => {
    const client = new FakeCoreApiClient([
      {
        id: 'call-recording-1',
        status: 'JOINING',
        externalBotId: 'recall-bot-1',
        startedAt: '2026-01-01T13:00:00.000Z',
        endedAt: '2026-01-01T13:15:00.000Z',
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
              twentyWorkspaceId: WORKSPACE_ID,
              twentyCallRecordingId: 'call-recording-1',
            },
          },
          status: {
            code: 'call_ended',
            sub_code: 'timeout_exceeded_waiting_room',
            created_at: '2026-01-01T13:19:00.000Z',
          },
        },
      },
    });

    expect(client.mutations).toEqual([
      {
        id: 'call-recording-1',
        data: {
          status: 'NOT_RECORDED',
          externalBotId: 'recall-bot-1',
          callRecorderFailureReason: 'timeout_exceeded_waiting_room',
          startedAt: null,
          endedAt: null,
        },
      },
    ]);
    expect(result).toEqual({
      status: 'updated',
      event: 'bot.status_change',
      callRecordingId: 'call-recording-1',
      callRecordingStatus: 'NOT_RECORDED',
    });
  });

  it('classifies a fatal meeting_not_started end as NOT_RECORDED', async () => {
    const client = new FakeCoreApiClient([
      {
        id: 'call-recording-1',
        status: 'JOINING',
        externalBotId: 'recall-bot-1',
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
              twentyWorkspaceId: WORKSPACE_ID,
              twentyCallRecordingId: 'call-recording-1',
            },
          },
          status: {
            code: 'fatal',
            sub_code: 'meeting_not_started',
            created_at: '2026-01-01T13:02:00.000Z',
          },
        },
      },
    });

    expect(client.mutations).toEqual([
      {
        id: 'call-recording-1',
        data: {
          status: 'NOT_RECORDED',
          externalBotId: 'recall-bot-1',
          callRecorderFailureReason: 'meeting_not_started',
        },
      },
    ]);
  });

  it('keeps PROCESSING with the recording end when the call ended after attendance', async () => {
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
              twentyWorkspaceId: WORKSPACE_ID,
              twentyCallRecordingId: 'call-recording-1',
            },
          },
          status: {
            code: 'call_ended',
            sub_code: 'timeout_exceeded_everyone_left',
            created_at: '2026-01-01T14:00:00.000Z',
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
          endedAt: '2026-01-01T14:00:00.000Z',
        },
      },
    ]);
  });

  it('keeps the fatal sub code as the failure reason for real failures', async () => {
    const client = new FakeCoreApiClient([
      {
        id: 'call-recording-1',
        status: 'JOINING',
        externalBotId: 'recall-bot-1',
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
              twentyWorkspaceId: WORKSPACE_ID,
              twentyCallRecordingId: 'call-recording-1',
            },
          },
          status: {
            code: 'fatal',
            sub_code: 'meeting_link_invalid',
            created_at: '2026-01-01T13:02:00.000Z',
          },
        },
      },
    });

    expect(client.mutations).toEqual([
      {
        id: 'call-recording-1',
        data: {
          status: 'FAILED',
          externalBotId: 'recall-bot-1',
          callRecorderFailureReason: 'meeting_link_invalid',
        },
      },
    ]);
  });

  it('still queues the artifact import when a done event arrives after NOT_RECORDED', async () => {
    const client = new FakeCoreApiClient([
      {
        id: 'call-recording-1',
        status: 'NOT_RECORDED',
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
              twentyWorkspaceId: WORKSPACE_ID,
              twentyCallRecordingId: 'call-recording-1',
            },
          },
          status: {
            code: 'done',
            created_at: '2026-01-01T13:20:00.000Z',
          },
        },
      },
    });

    expect(result).toEqual({
      status: 'skipped',
      event: 'bot.status_change',
      reason: 'stale status event (NOT_RECORDED -> PROCESSING)',
    });
    expect(client.mutations).toEqual([]);
    expect(importRequestCalls()).toHaveLength(1);
  });
});
