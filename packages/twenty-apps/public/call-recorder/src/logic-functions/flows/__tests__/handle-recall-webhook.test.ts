import { type ClientRequest, type IncomingMessage } from 'node:http';
import { PassThrough, Readable } from 'node:stream';

import { type CoreApiClient } from 'twenty-client-sdk/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { handleRecallWebhook } from 'src/logic-functions/flows/handle-recall-webhook.util';

const WORKSPACE_ID = '123e4567-e89b-12d3-a456-426614174000';

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

const metadataMutationMock = vi.hoisted(() => vi.fn());
const chargeCreditsMock = vi.hoisted(() => vi.fn());
const requestOverHttpsMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-client-sdk/metadata', () => ({
  MetadataApiClient: class {
    mutation = metadataMutationMock;
  },
}));

vi.mock('twenty-sdk/billing', () => ({
  chargeCredits: chargeCreditsMock,
}));

vi.mock('node:https', async () => {
  const actualHttps =
    await vi.importActual<typeof import('node:https')>('node:https');

  return { ...actualHttps, request: requestOverHttpsMock };
});

const RECALL_API_BASE_URL = 'https://us-west-2.recall.ai/api/v1';
const VIDEO_DOWNLOAD_URL = 'https://recall-media.example.com/video.mp4';
const AUDIO_DOWNLOAD_URL = 'https://recall-media.example.com/audio.mp3';
const TOO_LARGE_MEDIA_CONTENT_LENGTH_BYTES = 500 * 1024 * 1024 + 1;

const fetchMock = vi.fn();

let fetchRoutes: Record<string, () => Response>;

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), { status });

const mediaDownloadResponse = (contentLengthBytes: number): Response =>
  new Response(new Uint8Array(8), {
    status: 200,
    headers: { 'content-length': String(contentLengthBytes) },
  });

const setFetchRoute = (
  method: 'GET' | 'POST',
  url: string,
  buildResponse: () => Response,
) => {
  fetchRoutes[`${method} ${url}`] = buildResponse;
};

// Unrouted Recall API calls fail like the old per-util "disabled in test" defaults.
const defaultRecallApiResponse = (
  method: string,
  url: string,
): Response | undefined => {
  if (method === 'POST' && url.endsWith('/create_transcript/')) {
    return jsonResponse({ detail: 'transcript request disabled in test' }, 400);
  }

  if (method !== 'GET') {
    return undefined;
  }

  if (url.startsWith(`${RECALL_API_BASE_URL}/transcript/?recording_id=`)) {
    return jsonResponse({ results: [], next: null });
  }

  if (url.startsWith(`${RECALL_API_BASE_URL}/transcript/`)) {
    return jsonResponse(
      { detail: 'transcript retrieval disabled in test' },
      400,
    );
  }

  if (url.startsWith(`${RECALL_API_BASE_URL}/bot/`)) {
    return jsonResponse({ detail: 'bot fetch disabled in test' }, 404);
  }

  if (url.startsWith(`${RECALL_API_BASE_URL}/recording/`)) {
    return jsonResponse({ detail: 'media import disabled in test' }, 404);
  }

  return undefined;
};

const fetchedUrls = (): string[] =>
  fetchMock.mock.calls.map(([requestUrl]) => String(requestUrl));

const stubRecallRecordingMedia = ({
  externalRecordingId,
  videoContentLengthBytes,
  audioContentLengthBytes,
}: {
  externalRecordingId: string;
  videoContentLengthBytes?: number;
  audioContentLengthBytes?: number;
}) => {
  setFetchRoute(
    'GET',
    `${RECALL_API_BASE_URL}/recording/${externalRecordingId}/`,
    () =>
      jsonResponse({
        id: externalRecordingId,
        media_shortcuts: {
          ...(videoContentLengthBytes === undefined
            ? {}
            : { video_mixed: { download_url: VIDEO_DOWNLOAD_URL } }),
          ...(audioContentLengthBytes === undefined
            ? {}
            : { audio_mixed: { download_url: AUDIO_DOWNLOAD_URL } }),
        },
      }),
  );

  if (videoContentLengthBytes !== undefined) {
    setFetchRoute('GET', VIDEO_DOWNLOAD_URL, () =>
      mediaDownloadResponse(videoContentLengthBytes),
    );
  }

  if (audioContentLengthBytes !== undefined) {
    setFetchRoute('GET', AUDIO_DOWNLOAD_URL, () =>
      mediaDownloadResponse(audioContentLengthBytes),
    );
  }
};

type MediaUploadMutationRequest =
  | { createFileUpload: { __args: { filename: string } } }
  | { completeFileUpload: { __args: { fileId: string } } };

const FINAL_FILE_ID_BY_UPLOAD_FILE_ID: Record<string, string> = {
  'upload-video.mp4': 'file-video-1',
  'upload-audio.mp3': 'file-audio-1',
};

const stubMediaUploadTargets = () => {
  metadataMutationMock.mockImplementation(
    (mutation: MediaUploadMutationRequest) => {
      if ('createFileUpload' in mutation) {
        const { filename } = mutation.createFileUpload.__args;

        return Promise.resolve({
          createFileUpload: {
            fileId: `upload-${filename}`,
            uploadUrl: `https://storage.example.com/${filename}`,
            contentType: 'application/octet-stream',
          },
        });
      }

      const { fileId } = mutation.completeFileUpload.__args;

      return Promise.resolve({
        completeFileUpload: { id: FINAL_FILE_ID_BY_UPLOAD_FILE_ID[fileId] },
      });
    },
  );
};

const buildUploadRequest = (): ClientRequest => {
  const uploadRequest = new PassThrough();

  uploadRequest.on('finish', () => {
    const uploadResponse = Readable.from([]) as IncomingMessage;

    uploadResponse.statusCode = 200;
    uploadRequest.emit('response', uploadResponse);
  });

  return uploadRequest as unknown as ClientRequest;
};

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
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.stubEnv('RECALL_API_KEY', 'recall-api-key');
    vi.stubEnv('RECALL_REGION', 'us-west-2');
    fetchRoutes = {};
    fetchMock.mockReset();
    fetchMock.mockImplementation(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        const method = init?.method ?? 'GET';
        const route = fetchRoutes[`${method} ${url}`];

        if (route !== undefined) {
          return route();
        }

        const defaultResponse = defaultRecallApiResponse(method, url);

        if (defaultResponse === undefined) {
          throw new Error(`Unhandled fetch in test: ${method} ${url}`);
        }

        return defaultResponse;
      },
    );
    vi.stubGlobal('fetch', fetchMock);
    metadataMutationMock.mockReset();
    stubMediaUploadTargets();
    chargeCreditsMock.mockReset();
    chargeCreditsMock.mockResolvedValue(undefined);
    requestOverHttpsMock.mockReset();
    requestOverHttpsMock.mockImplementation(() => buildUploadRequest());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
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

  it('requests a transcript once when the recording first completes', async () => {
    setFetchRoute(
      'POST',
      `${RECALL_API_BASE_URL}/recording/recall-recording-1/create_transcript/`,
      () => jsonResponse({ id: 'recall-transcript-1' }),
    );
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

    expect(
      fetchedUrls().filter((requestUrl) =>
        requestUrl.endsWith('/create_transcript/'),
      ),
    ).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledWith(
      `${RECALL_API_BASE_URL}/recording/recall-recording-1/create_transcript/`,
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Token recall-api-key',
        }),
        body: JSON.stringify({
          provider: { recallai_async: { language_code: 'auto' } },
          diarization: { use_separate_streams_when_available: true },
        }),
      }),
    );
    expect(client.mutations).toEqual([
      {
        id: 'call-recording-1',
        data: {
          status: 'PROCESSING',
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

  it('does not re-request a transcript on a redelivered done event while Recall list is stale', async () => {
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

    expect(
      fetchedUrls().filter((requestUrl) =>
        requestUrl.endsWith('/create_transcript/'),
      ),
    ).toEqual([]);
    expect(fetchedUrls()).toContain(
      `${RECALL_API_BASE_URL}/transcript/?recording_id=recall-recording-1`,
    );
    expect(fetchedUrls()).toContain(
      `${RECALL_API_BASE_URL}/transcript/recall-transcript-1/`,
    );
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

  it('resolves the recording id from the bot when the payload and record lack one', async () => {
    setFetchRoute('GET', `${RECALL_API_BASE_URL}/bot/recall-bot-1/`, () =>
      jsonResponse({ recordings: [{ id: 'recall-recording-9' }] }),
    );
    setFetchRoute(
      'POST',
      `${RECALL_API_BASE_URL}/recording/recall-recording-9/create_transcript/`,
      () => jsonResponse({ id: 'recall-transcript-9' }),
    );
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

    expect(fetchMock).toHaveBeenCalledWith(
      `${RECALL_API_BASE_URL}/bot/recall-bot-1/`,
      expect.objectContaining({ method: 'GET' }),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      `${RECALL_API_BASE_URL}/recording/recall-recording-9/create_transcript/`,
      expect.objectContaining({ method: 'POST' }),
    );
    expect(client.mutations).toEqual([
      expect.objectContaining({
        id: 'call-recording-1',
        data: expect.objectContaining({
          status: 'PROCESSING',
          externalBotId: 'recall-bot-1',
          externalRecordingId: 'recall-recording-9',
        }),
      }),
    ]);
  });

  it('imports media on recording.done and completes once all artifacts are present', async () => {
    setFetchRoute('GET', `${RECALL_API_BASE_URL}/bot/recall-bot-1/`, () =>
      jsonResponse({ id: 'recall-bot-1' }),
    );
    stubRecallRecordingMedia({
      externalRecordingId: 'recall-recording-1',
      videoContentLengthBytes: 8,
      audioContentLengthBytes: 8,
    });
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

    expect(fetchedUrls()).toContain(
      `${RECALL_API_BASE_URL}/recording/recall-recording-1/`,
    );
    expect(fetchedUrls()).toContain(VIDEO_DOWNLOAD_URL);
    expect(fetchedUrls()).toContain(AUDIO_DOWNLOAD_URL);
    expect(client.mutations).toEqual([
      {
        id: 'call-recording-1',
        data: {
          externalBotId: 'recall-bot-1',
          externalRecordingId: 'recall-recording-1',
          audio: [{ fileId: 'file-audio-1', label: 'audio.mp3' }],
          video: [{ fileId: 'file-video-1', label: 'video.mp4' }],
        },
      },
      {
        id: 'call-recording-1',
        data: { status: 'COMPLETED' },
      },
    ]);
    expect(chargeCreditsMock).toHaveBeenCalledWith({
      creditsUsedMicro: 1_050_000,
      quantity: 63,
      operationType: 'CALL_RECORDING',
      resourceContext: 'recall',
    });
  });

  it('completes and keeps the size marker when a media file is too large', async () => {
    setFetchRoute('GET', `${RECALL_API_BASE_URL}/bot/recall-bot-1/`, () =>
      jsonResponse({ id: 'recall-bot-1' }),
    );
    stubRecallRecordingMedia({
      externalRecordingId: 'recall-recording-1',
      videoContentLengthBytes: TOO_LARGE_MEDIA_CONTENT_LENGTH_BYTES,
      audioContentLengthBytes: 8,
    });
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
      body: buildRecordingDoneWebhookBody(),
    });

    expect(client.mutations).toEqual([
      {
        id: 'call-recording-1',
        data: {
          externalBotId: 'recall-bot-1',
          externalRecordingId: 'recall-recording-1',
          audio: [{ fileId: 'file-audio-1', label: 'audio.mp3' }],
          callRecorderFailureReason: 'video_file_too_large',
        },
      },
      {
        id: 'call-recording-1',
        data: { status: 'COMPLETED' },
      },
    ]);
    expect(chargeCreditsMock).toHaveBeenCalledWith({
      creditsUsedMicro: 1_050_000,
      quantity: 63,
      operationType: 'CALL_RECORDING',
      resourceContext: 'recall',
    });
    expect(result).toEqual({
      status: 'updated',
      event: 'recording.done',
      callRecordingId: 'call-recording-1',
      callRecordingStatus: 'COMPLETED',
    });
  });

  it('keeps the real failure reason over the size marker on recording.failed', async () => {
    setFetchRoute('GET', `${RECALL_API_BASE_URL}/bot/recall-bot-1/`, () =>
      jsonResponse({ id: 'recall-bot-1' }),
    );
    stubRecallRecordingMedia({
      externalRecordingId: 'recall-recording-1',
      videoContentLengthBytes: TOO_LARGE_MEDIA_CONTENT_LENGTH_BYTES,
      audioContentLengthBytes: 8,
    });
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
          externalBotId: 'recall-bot-1',
          externalRecordingId: 'recall-recording-1',
          status: 'FAILED',
          callRecorderFailureReason: 'recording.failed',
          audio: [{ fileId: 'file-audio-1', label: 'audio.mp3' }],
        },
      },
    ]);
    expect(chargeCreditsMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      status: 'updated',
      event: 'recording.failed',
      callRecordingId: 'call-recording-1',
      callRecordingStatus: 'FAILED',
    });
  });

  it('stays PROCESSING on recording.done while artifacts are missing', async () => {
    setFetchRoute('GET', `${RECALL_API_BASE_URL}/bot/recall-bot-1/`, () =>
      jsonResponse({ id: 'recall-bot-1' }),
    );
    stubRecallRecordingMedia({
      externalRecordingId: 'recall-recording-1',
      audioContentLengthBytes: 8,
    });
    setFetchRoute(
      'POST',
      `${RECALL_API_BASE_URL}/recording/recall-recording-1/create_transcript/`,
      () => jsonResponse({ id: 'recall-transcript-1' }),
    );
    const client = new FakeCoreApiClient([
      {
        id: 'call-recording-1',
        status: 'PROCESSING',
        externalBotId: 'recall-bot-1',
        startedAt: '2026-01-01T13:02:00.000Z',
        endedAt: '2026-01-01T14:05:00.000Z',
        transcript: null,
      },
    ]);

    await handleRecallWebhook({
      client: client as unknown as CoreApiClient,
      body: buildRecordingDoneWebhookBody(),
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `${RECALL_API_BASE_URL}/recording/recall-recording-1/create_transcript/`,
      expect.objectContaining({ method: 'POST' }),
    );
    expect(client.mutations).toEqual([
      expect.objectContaining({
        id: 'call-recording-1',
        data: expect.objectContaining({
          status: 'PROCESSING',
          externalBotId: 'recall-bot-1',
          externalRecordingId: 'recall-recording-1',
          audio: [{ fileId: 'file-audio-1', label: 'audio.mp3' }],
        }),
      }),
    ]);
    expect(chargeCreditsMock).not.toHaveBeenCalled();
  });

  it('marks FAILED on recording.done when no recording artifact path exists', async () => {
    setFetchRoute('GET', `${RECALL_API_BASE_URL}/bot/recall-bot-1/`, () =>
      jsonResponse({ id: 'recall-bot-1', recordings: [] }),
    );
    const client = new FakeCoreApiClient([
      {
        id: 'call-recording-1',
        status: 'PROCESSING',
        externalBotId: 'recall-bot-1',
        startedAt: '2026-01-01T13:02:00.000Z',
        endedAt: '2026-01-01T14:05:00.000Z',
        transcript: null,
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
        },
      },
    });

    expect(result).toEqual({
      status: 'updated',
      event: 'recording.done',
      callRecordingId: 'call-recording-1',
      callRecordingStatus: 'FAILED',
    });
    expect(client.mutations).toEqual([
      {
        id: 'call-recording-1',
        data: {
          status: 'FAILED',
          externalBotId: 'recall-bot-1',
          callRecorderFailureReason: 'recording_artifacts_unavailable',
        },
      },
    ]);
    expect(chargeCreditsMock).not.toHaveBeenCalled();
  });

  it('completes and charges on transcript.done when media is already imported', async () => {
    const transcriptContent = [
      {
        participant: { id: 1, name: 'Alice' },
        words: [{ text: 'hello', start_timestamp: { relative: 0.5 } }],
      },
    ];

    setFetchRoute(
      'GET',
      `${RECALL_API_BASE_URL}/transcript/recall-transcript-1/`,
      () =>
        jsonResponse({
          data: {
            download_url: 'https://recall-transcripts.example.com/transcript-1',
          },
          status: { code: 'done', sub_code: null },
        }),
    );
    setFetchRoute(
      'GET',
      'https://recall-transcripts.example.com/transcript-1',
      () => jsonResponse(transcriptContent),
    );

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
        audio: [{ fileId: 'file-audio-1', label: 'audio.mp3' }],
        video: [{ fileId: 'file-video-1', label: 'video.mp4' }],
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
      status: 'updated',
      event: 'transcript.done',
      callRecordingId: 'call-recording-1',
      transcriptOutcome: 'FILLED',
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
    expect(chargeCreditsMock).toHaveBeenCalledWith({
      creditsUsedMicro: 1_050_000,
      quantity: 63,
      operationType: 'CALL_RECORDING',
      resourceContext: 'recall',
    });
  });

  it('fills the transcript from the download URL on transcript.done', async () => {
    const transcriptContent = [
      {
        participant: { id: 1, name: 'Alice' },
        words: [{ text: 'hello', start_timestamp: { relative: 0.5 } }],
      },
    ];

    setFetchRoute(
      'GET',
      `${RECALL_API_BASE_URL}/transcript/recall-transcript-1/`,
      () =>
        jsonResponse({
          data: {
            download_url: 'https://recall-transcripts.example.com/transcript-1',
          },
          status: { code: 'done', sub_code: null },
        }),
    );
    setFetchRoute(
      'GET',
      'https://recall-transcripts.example.com/transcript-1',
      () => jsonResponse(transcriptContent),
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
              twentyWorkspaceId: WORKSPACE_ID,
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
    expect(fetchMock).toHaveBeenCalledWith(
      `${RECALL_API_BASE_URL}/transcript/recall-transcript-1/`,
      expect.objectContaining({ method: 'GET' }),
    );
    expect(client.mutations).toEqual([
      {
        id: 'call-recording-1',
        data: {
          transcript: transcriptContent,
          externalRecordingId: 'recall-recording-1',
        },
      },
    ]);
    expect(chargeCreditsMock).not.toHaveBeenCalled();
  });

  it('writes a FAILED marker on transcript.failed', async () => {
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
          callRecorderFailureReason: 'transcript_failed:transcription_failed',
          status: 'FAILED',
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
      status: 'skipped',
      event: 'transcript.failed',
      reason: 'transcript already filled',
    });
    expect(client.mutations).toEqual([]);
  });
});
