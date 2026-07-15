import { type ClientRequest, type IncomingMessage } from 'node:http';
import { PassThrough, Readable } from 'node:stream';

import { type CoreApiClient } from 'twenty-client-sdk/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  syncCallRecording,
  type SyncableCallRecording,
} from 'src/logic-functions/flows/sync-call-recording.util';

const metadataMutationMock = vi.hoisted(() => vi.fn());
const requestOverHttpsMock = vi.hoisted(() => vi.fn());

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

const REQUESTED_AT = '2026-06-09T14:06:00.000Z';

const RECALL_BASE_URL = 'https://us-west-2.recall.ai/api/v1';
const RECALL_TRANSCRIPT_LIST_URL = `${RECALL_BASE_URL}/transcript/?recording_id=recall-recording-1`;
const RECALL_CREATE_TRANSCRIPT_URL = `${RECALL_BASE_URL}/recording/recall-recording-1/create_transcript/`;
const RECALL_RECORDING_URL = `${RECALL_BASE_URL}/recording/recall-recording-1/`;
const VIDEO_DOWNLOAD_URL = 'https://media.example.com/video.mp4';
const AUDIO_DOWNLOAD_URL = 'https://media.example.com/audio.mp3';

const fetchMock = vi.fn();
const fetchResponsesByRequest = new Map<string, () => unknown>();

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

const fetchedRequests = (): string[] =>
  fetchMock.mock.calls.map(
    ([requestUrl, requestInit]) =>
      `${requestInit?.method ?? 'GET'} ${requestUrl}`,
  );

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

class FakeCoreApiClient {
  mutations: Array<{ id: string; data: Record<string, unknown> }> = [];

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

const buildCallRecording = (
  overrides: Partial<SyncableCallRecording> = {},
): SyncableCallRecording => ({
  id: 'call-recording-1',
  status: 'RECORDING',
  startedAt: undefined,
  endedAt: undefined,
  externalRecordingId: undefined,
  callRecorderFailureReason: undefined,
  transcript: undefined,
  audio: undefined,
  video: undefined,
  ...overrides,
});

describe('syncCallRecording', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('RECALL_API_KEY', 'recall-api-key');
    vi.stubEnv('RECALL_REGION', 'us-west-2');
    fetchMock.mockReset();
    fetchMock.mockImplementation(
      async (requestUrl: string, requestInit?: { method?: string }) => {
        const respond = fetchResponsesByRequest.get(
          `${requestInit?.method ?? 'GET'} ${requestUrl}`,
        );

        if (respond === undefined) {
          throw new Error(
            `Unhandled fetch in test: ${requestInit?.method ?? 'GET'} ${requestUrl}`,
          );
        }

        return respond();
      },
    );
    fetchResponsesByRequest.clear();
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
    setFetchJsonResponse('GET', RECALL_RECORDING_URL, {
      id: 'recall-recording-1',
    });
    stubDirectUpload();
    stubUploadRequests();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('reports unchanged without touching artifacts when there is no bot snapshot and no recording id', async () => {
    const client = new FakeCoreApiClient();

    const result = await syncCallRecording({
      client: client as unknown as CoreApiClient,
      callRecording: buildCallRecording(),
      bot: undefined,
      treatRecordingAsDone: true,
      requestedAt: REQUESTED_AT,
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(client.mutations).toEqual([]);
    expect(result).toEqual({ updated: false, requestedTranscript: false });
  });

  it('reconciles artifacts from the row recording id on a done signal without a bot snapshot', async () => {
    const client = new FakeCoreApiClient();

    const result = await syncCallRecording({
      client: client as unknown as CoreApiClient,
      callRecording: buildCallRecording({
        status: 'PROCESSING',
        externalRecordingId: 'recall-recording-1',
      }),
      bot: undefined,
      treatRecordingAsDone: true,
      requestedAt: REQUESTED_AT,
    });

    expect(fetchedRequests()).toContain(`GET ${RECALL_TRANSCRIPT_LIST_URL}`);
    expect(fetchedRequests()).toContain(`POST ${RECALL_CREATE_TRANSCRIPT_URL}`);
    expect(fetchedRequests()).toContain(`GET ${RECALL_RECORDING_URL}`);
    expect(client.mutations).toEqual([
      {
        id: 'call-recording-1',
        data: {
          transcript: {
            recallTranscriptId: 'recall-transcript-1',
            status: 'PENDING',
            requestedAt: REQUESTED_AT,
          },
        },
      },
    ]);
    expect(result).toEqual({ updated: true, requestedTranscript: true });
  });

  it('gates artifacts on bot-reported doneness while still filling syncState fields', async () => {
    const client = new FakeCoreApiClient();

    const result = await syncCallRecording({
      client: client as unknown as CoreApiClient,
      callRecording: buildCallRecording({
        externalRecordingId: 'recall-recording-1',
      }),
      bot: {
        id: undefined,
        metadata: {},
        statusChanges: [
          { code: 'in_call_recording', createdAt: '2026-06-09T13:02:00.000Z' },
        ],
        recordings: [],
      },
      treatRecordingAsDone: false,
      requestedAt: REQUESTED_AT,
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(client.mutations).toEqual([
      {
        id: 'call-recording-1',
        data: { startedAt: '2026-06-09T13:02:00.000Z' },
      },
    ]);
    expect(result).toEqual({ updated: true, requestedTranscript: false });
  });

  it('fails the recording when the bot reports done without ever exposing a recording', async () => {
    const client = new FakeCoreApiClient();

    const result = await syncCallRecording({
      client: client as unknown as CoreApiClient,
      callRecording: buildCallRecording(),
      bot: {
        id: undefined,
        metadata: {},
        statusChanges: [
          { code: 'done', createdAt: '2026-06-09T14:05:00.000Z' },
        ],
        recordings: [],
      },
      treatRecordingAsDone: false,
      requestedAt: REQUESTED_AT,
    });

    expect(client.mutations).toEqual([
      {
        id: 'call-recording-1',
        data: {
          status: 'FAILED',
          callRecorderFailureReason: 'recording_artifacts_unavailable',
        },
      },
    ]);
    expect(result).toEqual({ updated: true, requestedTranscript: false });
  });

  it('keeps the failure reason of a failing update over a media size marker', async () => {
    setFetchJsonResponse('GET', RECALL_TRANSCRIPT_LIST_URL, {
      next: null,
      results: [
        {
          id: 'recall-transcript-1',
          status: { code: 'failed', sub_code: 'audio_missing' },
        },
      ],
    });
    setFetchJsonResponse('GET', RECALL_RECORDING_URL, {
      id: 'recall-recording-1',
      media_shortcuts: {
        video_mixed: { download_url: VIDEO_DOWNLOAD_URL },
        audio_mixed: { download_url: AUDIO_DOWNLOAD_URL },
      },
    });
    setFetchResponse('GET', VIDEO_DOWNLOAD_URL, () =>
      buildOversizedMediaDownloadResponse(),
    );
    setFetchResponse('GET', AUDIO_DOWNLOAD_URL, () =>
      buildMediaDownloadResponse(8),
    );
    const client = new FakeCoreApiClient();

    await syncCallRecording({
      client: client as unknown as CoreApiClient,
      callRecording: buildCallRecording({
        status: 'PROCESSING',
        externalRecordingId: 'recall-recording-1',
      }),
      bot: undefined,
      treatRecordingAsDone: true,
      requestedAt: REQUESTED_AT,
    });

    expect(client.mutations).toEqual([
      {
        id: 'call-recording-1',
        data: {
          status: 'FAILED',
          callRecorderFailureReason: 'transcript_failed:audio_missing',
          transcript: {
            recallTranscriptId: 'recall-transcript-1',
            status: 'FAILED',
            subCode: 'audio_missing',
          },
          audio: [{ fileId: 'file-audio-1', label: 'audio.mp3' }],
        },
      },
    ]);
  });
});
