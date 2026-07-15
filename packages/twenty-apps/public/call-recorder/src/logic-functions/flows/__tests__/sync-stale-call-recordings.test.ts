import { type ClientRequest, type IncomingMessage } from 'node:http';
import { PassThrough, Readable } from 'node:stream';

import { type CoreApiClient } from 'twenty-client-sdk/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { syncStaleCallRecordings } from 'src/logic-functions/flows/sync-stale-call-recordings.util';

const chargeCreditsMock = vi.hoisted(() => vi.fn());
const metadataMutationMock = vi.hoisted(() => vi.fn());
const requestOverHttpsMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-sdk/billing', () => ({
  chargeCredits: chargeCreditsMock,
}));

vi.mock('twenty-client-sdk/metadata', () => ({
  MetadataApiClient: class {
    mutation = metadataMutationMock;
  },
}));

vi.mock('node:https', async () => {
  const actualHttps =
    await vi.importActual<typeof import('node:https')>('node:https');

  return { ...actualHttps, request: requestOverHttpsMock };
});

const NOW = new Date('2026-06-10T12:00:00.000Z');
const WORKSPACE_ID = '123e4567-e89b-12d3-a456-426614174000';

const RECALL_BASE_URL = 'https://us-west-2.recall.ai/api/v1';
const RECALL_LIST_BOTS_URL_PREFIX = `${RECALL_BASE_URL}/bot/?`;
const RECALL_BOT_URL = `${RECALL_BASE_URL}/bot/recall-bot-1/`;
const RECALL_TRANSCRIPT_LIST_URL = `${RECALL_BASE_URL}/transcript/?recording_id=recall-recording-1`;
const RECALL_CREATE_TRANSCRIPT_URL = `${RECALL_BASE_URL}/recording/recall-recording-1/create_transcript/`;
const RECALL_TRANSCRIPT_DETAILS_URL = `${RECALL_BASE_URL}/transcript/recall-transcript-1/`;
const RECALL_RECORDING_URL = `${RECALL_BASE_URL}/recording/recall-recording-1/`;
const TRANSCRIPT_DOWNLOAD_URL = 'https://media.example.com/transcript.json';
const VIDEO_DOWNLOAD_URL = 'https://media.example.com/video.mp4';
const AUDIO_DOWNLOAD_URL = 'https://media.example.com/audio.mp3';

const RECORDING_WITH_MEDIA = {
  id: 'recall-recording-1',
  media_shortcuts: {
    video_mixed: { download_url: VIDEO_DOWNLOAD_URL },
    audio_mixed: { download_url: AUDIO_DOWNLOAD_URL },
  },
};

// 2026-06-09T13:02:00.000Z -> 2026-06-09T14:00:00.000Z at 1_000_000 micro-credits per hour.
const CHARGE_FOR_58_RECORDED_MINUTES = {
  creditsUsedMicro: 966_667,
  quantity: 58,
  operationType: 'CALL_RECORDING',
  resourceContext: 'recall',
};

const buildAccessToken = (payload: Record<string, unknown>): string =>
  [
    Buffer.from(JSON.stringify({ alg: 'none' })).toString('base64url'),
    Buffer.from(JSON.stringify(payload)).toString('base64url'),
    'signature',
  ].join('.');

const fetchMock = vi.fn();
const fetchResponsesByRequest = new Map<string, () => unknown>();
let listBotsRespond: () => unknown;

const setFetchResponse = (
  method: string,
  url: string,
  respond: () => unknown,
) => {
  fetchResponsesByRequest.set(`${method} ${url}`, respond);
};

const setFetchJsonResponse = (
  method: string,
  url: string,
  body: unknown,
  status = 200,
) => {
  setFetchResponse(
    method,
    url,
    () => new Response(JSON.stringify(body), { status }),
  );
};

const setRecallBotResponse = (bot: Record<string, unknown>) => {
  setFetchJsonResponse('GET', RECALL_BOT_URL, bot);
};

const setListedBotsResponse = (bots: unknown[]) => {
  listBotsRespond = () =>
    new Response(JSON.stringify({ next: null, results: bots }), {
      status: 200,
    });
};

const fetchedRequests = (): string[] =>
  fetchMock.mock.calls.map(
    ([requestUrl, requestInit]) =>
      `${requestInit?.method ?? 'GET'} ${requestUrl}`,
  );

const listBotRequestUrls = (): string[] =>
  fetchMock.mock.calls
    .filter(
      ([requestUrl, requestInit]) =>
        (requestInit?.method ?? 'GET') === 'GET' &&
        requestUrl.startsWith(RECALL_LIST_BOTS_URL_PREFIX),
    )
    .map(([requestUrl]) => requestUrl);

const botGetRequestUrls = (): string[] =>
  fetchMock.mock.calls
    .filter(
      ([requestUrl, requestInit]) =>
        (requestInit?.method ?? 'GET') === 'GET' &&
        requestUrl.startsWith(`${RECALL_BASE_URL}/bot/`) &&
        !requestUrl.includes('?'),
    )
    .map(([requestUrl]) => requestUrl);

const buildMediaDownloadResponse = (contentLengthBytes: number) => ({
  ok: true,
  status: 200,
  headers: {
    get: (name: string) =>
      name.toLowerCase() === 'content-length'
        ? String(contentLengthBytes)
        : null,
  },
  body: new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new Uint8Array(contentLengthBytes));
      controller.close();
    },
  }),
});

const buildOversizedMediaDownloadResponse = () => ({
  ok: true,
  status: 200,
  headers: {
    get: (name: string) =>
      name.toLowerCase() === 'content-length'
        ? String(500 * 1024 * 1024 + 1)
        : null,
  },
  body: { cancel: async () => {} },
});

type DirectUploadMutationRequest =
  | { createFileUpload: { __args: { filename: string } } }
  | { completeFileUpload: { __args: { fileId: string } } };

const FINAL_FILE_ID_BY_FILENAME: Record<string, string> = {
  'video.mp4': 'file-video-1',
  'audio.mp3': 'file-audio-1',
};

const stubDirectUpload = () => {
  metadataMutationMock.mockReset();
  metadataMutationMock.mockImplementation(
    async (mutationRequest: DirectUploadMutationRequest) => {
      if ('createFileUpload' in mutationRequest) {
        const { filename } = mutationRequest.createFileUpload.__args;

        return {
          createFileUpload: {
            fileId: filename,
            uploadUrl: `https://storage.example.com/${filename}`,
            contentType: 'application/octet-stream',
          },
        };
      }

      return {
        completeFileUpload: {
          id: FINAL_FILE_ID_BY_FILENAME[
            mutationRequest.completeFileUpload.__args.fileId
          ],
        },
      };
    },
  );
};

const stubUploadRequests = () => {
  requestOverHttpsMock.mockReset();
  requestOverHttpsMock.mockImplementation(() => {
    const uploadRequest = new PassThrough();

    uploadRequest.resume();
    uploadRequest.on('finish', () => {
      const uploadResponse = Readable.from([]) as IncomingMessage;

      uploadResponse.statusCode = 200;
      uploadRequest.emit('response', uploadResponse);
    });

    return uploadRequest as unknown as ClientRequest;
  });
};

type CallRecordingNode = Record<string, unknown>;

class FakeCoreApiClient {
  filters: Array<Record<string, unknown>> = [];
  mutations: Array<{ id: string; data: Record<string, unknown> }> = [];

  constructor(private callRecordingNodes: CallRecordingNode[]) {}

  async query(query: any): Promise<any> {
    this.filters.push(query.callRecordings.__args.filter);

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

describe('syncStaleCallRecordings', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('RECALL_API_KEY', 'recall-api-key');
    vi.stubEnv('RECALL_REGION', 'us-west-2');
    vi.stubEnv(
      'TWENTY_APP_ACCESS_TOKEN',
      buildAccessToken({ workspaceId: WORKSPACE_ID }),
    );
    fetchMock.mockReset();
    fetchMock.mockImplementation(
      async (requestUrl: string, requestInit?: { method?: string }) => {
        const method = requestInit?.method ?? 'GET';
        const respond = fetchResponsesByRequest.get(`${method} ${requestUrl}`);

        if (respond !== undefined) {
          return respond();
        }

        if (
          method === 'GET' &&
          requestUrl.startsWith(RECALL_LIST_BOTS_URL_PREFIX)
        ) {
          return listBotsRespond();
        }

        throw new Error(`Unhandled fetch in test: ${method} ${requestUrl}`);
      },
    );
    fetchResponsesByRequest.clear();
    setListedBotsResponse([]);
    setFetchJsonResponse('GET', RECALL_TRANSCRIPT_LIST_URL, {
      next: null,
      results: [],
    });
    setFetchJsonResponse(
      'POST',
      RECALL_CREATE_TRANSCRIPT_URL,
      { id: 'recall-transcript-1' },
      201,
    );
    setFetchJsonResponse('GET', RECALL_TRANSCRIPT_DETAILS_URL, {
      status: { code: 'processing' },
    });
    setFetchJsonResponse('GET', RECALL_RECORDING_URL, {
      id: 'recall-recording-1',
    });
    stubDirectUpload();
    stubUploadRequests();
    chargeCreditsMock.mockReset();
    chargeCreditsMock.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('queries only diverged candidate rows', async () => {
    const client = buildClient([]);

    await syncStaleCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(client.filters).toEqual([
      {
        or: [
          {
            recordingRequestStatus: { eq: 'REQUESTED' },
            status: {
              in: ['SCHEDULED', 'JOINING', 'RECORDING', 'PROCESSING'],
            },
            externalBotId: { is: 'NOT_NULL' },
          },
          {
            status: { eq: 'COMPLETED' },
            or: [{ startedAt: { is: 'NULL' } }, { endedAt: { is: 'NULL' } }],
          },
        ],
      },
    ]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('heals a stuck RECORDING record from the Recall bot state', async () => {
    setRecallBotResponse({
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
    });
    const client = buildClient([buildStuckRecordingNode()]);

    const result = await syncStaleCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    const botRequestCall = fetchMock.mock.calls.find(
      ([requestUrl]) => requestUrl === RECALL_BOT_URL,
    );
    expect(botRequestCall?.[1].headers).toMatchObject({
      Authorization: 'Token recall-api-key',
    });
    expect(fetchedRequests()).toContain(`GET ${RECALL_RECORDING_URL}`);
    expect(fetchedRequests()).toContain(`GET ${RECALL_TRANSCRIPT_LIST_URL}`);
    expect(fetchedRequests()).toContain(`POST ${RECALL_CREATE_TRANSCRIPT_URL}`);
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
    expect(chargeCreditsMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      candidateCount: 1,
      updatedCallRecordingIds: ['call-recording-1'],
      markedFailedCallRecordingIds: [],
      requestedTranscriptCallRecordingIds: ['call-recording-1'],
      unsyncedCallRecordingIds: [],
      skippedNotStartedCallRecordingIds: [],
    });
  });

  it('uses a listed Recall bot snapshot instead of fetching the bot by id', async () => {
    setListedBotsResponse([
      {
        id: 'recall-bot-1',
        metadata: { twentyWorkspaceId: WORKSPACE_ID },
        status_changes: [
          { code: 'in_call_recording', created_at: '2026-06-09T13:02:30.000Z' },
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
    ]);
    const client = buildClient([buildStuckRecordingNode()]);

    const result = await syncStaleCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(listBotRequestUrls()).toHaveLength(1);
    const listRequestParams = new URL(listBotRequestUrls()[0]).searchParams;
    expect(listRequestParams.get('join_at_after')).toBe(
      '2026-06-02T12:00:00.000Z',
    );
    expect(listRequestParams.get('join_at_before')).toBe(
      '2026-06-10T13:00:00.000Z',
    );
    expect(listRequestParams.get('metadata__twentyWorkspaceId')).toBe(
      WORKSPACE_ID,
    );
    expect(botGetRequestUrls()).toEqual([]);
    expect(result.updatedCallRecordingIds).toEqual(['call-recording-1']);
  });

  it('defers the run without per-id fetches when the Recall bot list fails', async () => {
    listBotsRespond = () =>
      new Response(JSON.stringify({ detail: 'bad request' }), { status: 400 });
    const client = buildClient([buildStuckRecordingNode()]);

    const result = await syncStaleCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(botGetRequestUrls()).toEqual([]);
    expect(client.mutations).toEqual([]);
    expect(result.updatedCallRecordingIds).toEqual([]);
    expect(console.warn).toHaveBeenCalled();
  });

  it('fails the row when the bot completed without ever recording instead of looping forever', async () => {
    setRecallBotResponse({
      status_changes: [
        { code: 'done', created_at: '2026-06-09T14:05:00.000Z' },
      ],
      recordings: [],
    });
    const client = buildClient([buildStuckRecordingNode()]);

    const result = await syncStaleCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(fetchedRequests()).not.toContain(
      `GET ${RECALL_TRANSCRIPT_LIST_URL}`,
    );
    expect(fetchedRequests()).not.toContain(`GET ${RECALL_RECORDING_URL}`);
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
    setRecallBotResponse({
      status_changes: [
        { code: 'done', created_at: '2026-06-09T14:04:00.000Z' },
        { code: 'fatal', created_at: '2026-06-09T14:05:00.000Z' },
      ],
      recordings: [],
    });
    const client = buildClient([buildStuckRecordingNode()]);

    await syncStaleCallRecordings({
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

  it('completes and charges when the sync lands the last artifact', async () => {
    setRecallBotResponse({
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
    });
    setFetchJsonResponse('GET', RECALL_RECORDING_URL, RECORDING_WITH_MEDIA);
    setFetchResponse('GET', VIDEO_DOWNLOAD_URL, () =>
      buildMediaDownloadResponse(8),
    );
    setFetchResponse('GET', AUDIO_DOWNLOAD_URL, () =>
      buildMediaDownloadResponse(8),
    );
    const client = buildClient([
      buildStuckRecordingNode({
        status: 'PROCESSING',
        startedAt: '2026-06-09T13:02:00.000Z',
        endedAt: '2026-06-09T14:00:00.000Z',
        externalRecordingId: 'recall-recording-1',
        transcript: [{ participant: { id: 1 }, words: [] }],
      }),
    ]);

    const result = await syncStaleCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(fetchedRequests()).not.toContain(
      `POST ${RECALL_CREATE_TRANSCRIPT_URL}`,
    );
    expect(fetchedRequests()).not.toContain(
      `GET ${RECALL_TRANSCRIPT_LIST_URL}`,
    );
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
    expect(chargeCreditsMock).toHaveBeenCalledWith(
      CHARGE_FOR_58_RECORDED_MINUTES,
    );
    expect(result).toEqual({
      candidateCount: 1,
      updatedCallRecordingIds: ['call-recording-1'],
      markedFailedCallRecordingIds: [],
      requestedTranscriptCallRecordingIds: [],
      unsyncedCallRecordingIds: [],
      skippedNotStartedCallRecordingIds: [],
    });
  });

  it('completes and charges when the missing video is marked too large', async () => {
    setRecallBotResponse({
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
    });
    setFetchJsonResponse('GET', RECALL_RECORDING_URL, RECORDING_WITH_MEDIA);
    setFetchResponse('GET', VIDEO_DOWNLOAD_URL, () =>
      buildOversizedMediaDownloadResponse(),
    );
    setFetchResponse('GET', AUDIO_DOWNLOAD_URL, () =>
      buildMediaDownloadResponse(8),
    );
    const client = buildClient([
      buildStuckRecordingNode({
        status: 'PROCESSING',
        startedAt: '2026-06-09T13:02:00.000Z',
        endedAt: '2026-06-09T14:00:00.000Z',
        externalRecordingId: 'recall-recording-1',
        transcript: [{ participant: { id: 1 }, words: [] }],
      }),
    ]);

    const result = await syncStaleCallRecordings({
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
    expect(chargeCreditsMock).toHaveBeenCalledWith(
      CHARGE_FOR_58_RECORDED_MINUTES,
    );
    expect(result.updatedCallRecordingIds).toEqual(['call-recording-1']);
  });

  it('completes from a persisted size marker once the transcript lands', async () => {
    setRecallBotResponse({
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
    });
    setFetchJsonResponse('GET', RECALL_RECORDING_URL, {
      id: 'recall-recording-1',
      media_shortcuts: {
        audio_mixed: { download_url: AUDIO_DOWNLOAD_URL },
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

    const result = await syncStaleCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(fetchedRequests()).toContain(`GET ${RECALL_RECORDING_URL}`);
    expect(fetchedRequests()).not.toContain(`GET ${AUDIO_DOWNLOAD_URL}`);
    expect(client.mutations).toEqual([
      {
        id: 'call-recording-1',
        data: { status: 'COMPLETED' },
      },
    ]);
    expect(chargeCreditsMock).toHaveBeenCalledWith(
      CHARGE_FOR_58_RECORDED_MINUTES,
    );
    expect(result.updatedCallRecordingIds).toEqual(['call-recording-1']);
  });

  it('keeps the real failure reason over the size marker when the bot failed', async () => {
    setRecallBotResponse({
      status_changes: [
        { code: 'fatal', created_at: '2026-06-09T14:05:00.000Z' },
      ],
      recordings: [
        {
          id: 'recall-recording-1',
          started_at: '2026-06-09T13:02:00.000Z',
          completed_at: '2026-06-09T14:00:00.000Z',
        },
      ],
    });
    setFetchJsonResponse('GET', RECALL_RECORDING_URL, RECORDING_WITH_MEDIA);
    setFetchResponse('GET', VIDEO_DOWNLOAD_URL, () =>
      buildOversizedMediaDownloadResponse(),
    );
    setFetchResponse('GET', AUDIO_DOWNLOAD_URL, () =>
      buildMediaDownloadResponse(8),
    );
    const client = buildClient([
      buildStuckRecordingNode({
        status: 'PROCESSING',
        startedAt: '2026-06-09T13:02:00.000Z',
        endedAt: '2026-06-09T14:00:00.000Z',
        externalRecordingId: 'recall-recording-1',
        transcript: [{ participant: { id: 1 }, words: [] }],
      }),
    ]);

    await syncStaleCallRecordings({
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
    expect(chargeCreditsMock).not.toHaveBeenCalled();
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

    const result = await syncStaleCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(client.mutations).toEqual([]);
    expect(result.skippedNotStartedCallRecordingIds).toEqual([
      'call-recording-1',
    ]);
  });

  it('syncs a meeting that ended early while its scheduled end is still in the future', async () => {
    setRecallBotResponse({
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
    });
    const client = buildClient([
      buildStuckRecordingNode({
        calendarEvent: {
          startsAt: '2026-06-10T11:00:00.000Z',
          endsAt: '2026-06-10T13:00:00.000Z',
        },
      }),
    ]);

    const result = await syncStaleCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(fetchedRequests()).toContain(`GET ${RECALL_BOT_URL}`);
    expect(result.updatedCallRecordingIds).toEqual(['call-recording-1']);
    expect(result.skippedNotStartedCallRecordingIds).toEqual([]);
  });

  it('marks FAILED without clearing the bot id when Recall returns 404', async () => {
    setFetchJsonResponse('GET', RECALL_BOT_URL, { detail: 'Not found.' }, 404);
    const client = buildClient([buildStuckRecordingNode()]);

    const result = await syncStaleCallRecordings({
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
    setFetchJsonResponse('GET', RECALL_BOT_URL, { detail: 'Not found.' }, 404);
    const client = buildClient([
      buildStuckRecordingNode({
        status: 'COMPLETED',
        startedAt: '2026-06-09T13:02:00.000Z',
        transcript: [{ participant: { id: 1 }, words: [] }],
      }),
    ]);

    const result = await syncStaleCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(client.mutations).toEqual([]);
    expect(result.unsyncedCallRecordingIds).toEqual(['call-recording-1']);
  });

  it('logs candidates whose meeting ended before the lookback bound instead of syncing them', async () => {
    const client = buildClient([
      buildStuckRecordingNode({
        calendarEvent: { endsAt: '2026-06-01T13:00:00.000Z' },
      }),
    ]);

    const result = await syncStaleCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(client.mutations).toEqual([]);
    expect(result.unsyncedCallRecordingIds).toEqual(['call-recording-1']);
    expect(console.warn).toHaveBeenCalled();
  });

  it('does not use old createdAt as the sync bound when calendar data is missing', async () => {
    setRecallBotResponse({
      status_changes: [
        { code: 'in_call_recording', created_at: '2026-06-09T13:02:00.000Z' },
      ],
    });
    const client = buildClient([
      buildStuckRecordingNode({
        calendarEvent: null,
        createdAt: '2026-06-01T12:00:00.000Z',
        startedAt: '2026-06-09T13:02:00.000Z',
      }),
    ]);

    const result = await syncStaleCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(fetchedRequests()).toContain(`GET ${RECALL_BOT_URL}`);
    expect(result.unsyncedCallRecordingIds).toEqual([]);
  });

  it('prunes an eventless candidate that never started once createdAt passes the bound', async () => {
    const client = buildClient([
      buildStuckRecordingNode({
        calendarEvent: null,
        createdAt: '2026-06-01T12:00:00.000Z',
      }),
    ]);

    const result = await syncStaleCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(client.mutations).toEqual([]);
    expect(result.unsyncedCallRecordingIds).toEqual(['call-recording-1']);
  });

  it('rotates the capped per-id fallback window so the same tail is not always skipped', async () => {
    const candidateNodes = Array.from({ length: 27 }, (_, index) =>
      buildStuckRecordingNode({
        id: `call-recording-${index + 1}`,
        externalBotId: `recall-bot-${index + 1}`,
        calendarEvent: null,
      }),
    );

    candidateNodes.forEach((_, index) => {
      setFetchJsonResponse(
        'GET',
        `${RECALL_BASE_URL}/bot/recall-bot-${index + 1}/`,
        { detail: 'bad request' },
        400,
      );
    });

    await syncStaleCallRecordings({
      client: buildClient(candidateNodes) as unknown as CoreApiClient,
      now: new Date(0),
    });

    expect(botGetRequestUrls()).toEqual(
      Array.from(
        { length: 25 },
        (_, index) => `${RECALL_BASE_URL}/bot/recall-bot-${index + 1}/`,
      ),
    );

    fetchMock.mockClear();

    await syncStaleCallRecordings({
      client: buildClient(candidateNodes) as unknown as CoreApiClient,
      now: new Date(15 * 60 * 1000),
    });

    expect(botGetRequestUrls()).toEqual(
      Array.from(
        { length: 25 },
        (_, index) => `${RECALL_BASE_URL}/bot/recall-bot-${index + 2}/`,
      ),
    );
  });

  it('applies the downgrade guard to pulled statuses while still filling timestamps', async () => {
    setRecallBotResponse({
      status_changes: [
        { code: 'in_call_recording', created_at: '2026-06-09T13:02:00.000Z' },
      ],
      recordings: [
        { id: 'recall-recording-1', started_at: '2026-06-09T13:02:00.000Z' },
      ],
    });
    const client = buildClient([
      buildStuckRecordingNode({ status: 'PROCESSING' }),
    ]);

    await syncStaleCallRecordings({
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
    setRecallBotResponse({
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
    });
    const client = buildClient([
      buildStuckRecordingNode({
        status: 'COMPLETED',
        startedAt: '2026-06-09T13:02:00.000Z',
        externalRecordingId: 'recall-recording-1',
      }),
    ]);

    const result = await syncStaleCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(
      fetchedRequests().filter(
        (request) => request === `POST ${RECALL_CREATE_TRANSCRIPT_URL}`,
      ),
    ).toHaveLength(1);
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
    setRecallBotResponse({
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
    });
    setFetchJsonResponse('GET', RECALL_TRANSCRIPT_LIST_URL, {
      next: null,
      results: [{ id: 'recall-transcript-1', status: { code: 'processing' } }],
    });
    const client = buildClient([buildStuckRecordingNode()]);

    const result = await syncStaleCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(fetchedRequests()).not.toContain(
      `POST ${RECALL_CREATE_TRANSCRIPT_URL}`,
    );
    expect(fetchedRequests()).not.toContain(
      `GET ${RECALL_TRANSCRIPT_DETAILS_URL}`,
    );
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

  it('fills a completed Recall transcript artifact during sync', async () => {
    const transcriptContent = [
      {
        participant: { id: 1, name: 'Ada' },
        words: [{ text: 'hello', start_timestamp: 1, end_timestamp: 2 }],
      },
    ];

    setRecallBotResponse({
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
    });
    setFetchJsonResponse('GET', RECALL_TRANSCRIPT_LIST_URL, {
      next: null,
      results: [{ id: 'recall-transcript-1', status: { code: 'done' } }],
    });
    setFetchJsonResponse('GET', RECALL_TRANSCRIPT_DETAILS_URL, {
      data: { download_url: TRANSCRIPT_DOWNLOAD_URL },
      status: { code: 'done' },
    });
    setFetchJsonResponse('GET', TRANSCRIPT_DOWNLOAD_URL, transcriptContent);
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

    const result = await syncStaleCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(fetchedRequests()).not.toContain(
      `POST ${RECALL_CREATE_TRANSCRIPT_URL}`,
    );
    expect(fetchedRequests()).toContain(`GET ${RECALL_TRANSCRIPT_DETAILS_URL}`);
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
    expect(chargeCreditsMock).toHaveBeenCalledWith(
      CHARGE_FOR_58_RECORDED_MINUTES,
    );
    expect(result.requestedTranscriptCallRecordingIds).toEqual([]);
  });

  it('marks the call recording failed when Recall has a failed transcript artifact', async () => {
    setRecallBotResponse({
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
    });
    setFetchJsonResponse('GET', RECALL_TRANSCRIPT_LIST_URL, {
      next: null,
      results: [
        {
          id: 'recall-transcript-1',
          status: { code: 'failed', sub_code: 'audio_missing' },
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

    const result = await syncStaleCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(fetchedRequests()).not.toContain(
      `POST ${RECALL_CREATE_TRANSCRIPT_URL}`,
    );
    expect(fetchedRequests()).not.toContain(
      `GET ${RECALL_TRANSCRIPT_DETAILS_URL}`,
    );
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
    setRecallBotResponse({
      status_changes: [
        { code: 'in_call_recording', created_at: '2026-06-09T13:02:00.000Z' },
      ],
    });
    const client = buildClient([
      buildStuckRecordingNode({ startedAt: '2026-06-09T13:02:00.000Z' }),
    ]);

    const result = await syncStaleCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(client.mutations).toEqual([]);
    expect(result.updatedCallRecordingIds).toEqual([]);
  });
});
