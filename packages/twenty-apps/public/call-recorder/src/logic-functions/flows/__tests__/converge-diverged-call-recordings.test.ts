import { type CoreApiClient } from 'twenty-client-sdk/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CALL_RECORDER_NAME_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-name-env-var-name';
import { RECALL_API_KEY_ENV_VAR_NAME } from 'src/logic-functions/constants/recall-api-key-env-var-name';
import { RECALL_REGION_ENV_VAR_NAME } from 'src/logic-functions/constants/recall-region-env-var-name';
import { convergeDivergedCallRecordings } from 'src/logic-functions/flows/converge-diverged-call-recordings.util';

const chargeCreditsMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-sdk/billing', () => ({
  chargeCredits: chargeCreditsMock,
}));

const NOW = new Date('2026-06-10T12:00:00.000Z');
const WORKSPACE_ID = 'workspace-1';
const RECALL_BASE_URL = 'https://us-east-1.recall.ai/api/v1';
const APP_ACCESS_TOKEN_ENV_VAR_NAME = 'TWENTY_APP_ACCESS_TOKEN';
const TRANSCRIPT_DOWNLOAD_URL = 'https://downloads.recall.test/transcript.json';
const VIDEO_DOWNLOAD_URL = 'https://downloads.recall.test/video.mp4';
const ENV_VAR_NAMES = [
  RECALL_API_KEY_ENV_VAR_NAME,
  RECALL_REGION_ENV_VAR_NAME,
  CALL_RECORDER_NAME_ENV_VAR_NAME,
  APP_ACCESS_TOKEN_ENV_VAR_NAME,
] as const;
const ORIGINAL_ENV_VALUES = ENV_VAR_NAMES.map(
  (envVarName) => [envVarName, process.env[envVarName]] as const,
);

// getCurrentWorkspaceId reads the workspace id from the injected token's JWT payload.
const buildAppAccessToken = (workspaceId: string): string =>
  [
    'header',
    Buffer.from(JSON.stringify({ workspaceId })).toString('base64url'),
    'signature',
  ].join('.');

type FakeResponse = {
  ok: boolean;
  status: number;
  statusText: string;
  headers: { get: (name: string) => string | null };
  json: () => Promise<unknown>;
  text: () => Promise<string>;
  body: null;
};

const buildJsonResponse = (
  status: number,
  body: unknown,
  headers: Record<string, string> = {},
): FakeResponse => ({
  ok: status >= 200 && status < 300,
  status,
  statusText: '',
  headers: {
    get: (name: string) => headers[name.toLowerCase()] ?? null,
  },
  json: async () => body,
  text: async () => JSON.stringify(body),
  body: null,
});

type RecallFetchState = {
  listedBots: unknown[];
  listStatus: number;
  botPayloadsById: Record<string, unknown>;
  botStatusesById: Record<string, number>;
  transcriptSummaries: unknown[];
  transcriptPayloadsById: Record<string, unknown>;
  downloadContentsByUrl: Record<string, unknown>;
  downloadContentLengthsByUrl: Record<string, number>;
  recordingPayloadsById: Record<string, unknown>;
  createdTranscriptId: string;
};

const buildInitialRecallState = (): RecallFetchState => ({
  listedBots: [],
  listStatus: 200,
  botPayloadsById: {},
  botStatusesById: {},
  transcriptSummaries: [],
  transcriptPayloadsById: {},
  downloadContentsByUrl: {},
  downloadContentLengthsByUrl: {},
  recordingPayloadsById: {},
  createdTranscriptId: 'recall-transcript-1',
});

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

const buildDoneRecording = () => ({
  id: 'recall-recording-1',
  started_at: '2026-06-09T13:02:00.000Z',
  completed_at: '2026-06-09T14:00:00.000Z',
});

// 58 recorded minutes at 1,000,000 micro credits per hour.
const EXPECTED_CHARGE = {
  creditsUsedMicro: 966667,
  quantity: 58,
  operationType: 'CALL_RECORDING',
  resourceContext: 'recall',
};

describe('convergeDivergedCallRecordings', () => {
  const fetchMock = vi.fn();
  let recall: RecallFetchState;

  const respondToFetch = (
    url: string,
    init?: { method?: string },
  ): FakeResponse => {
    if (url.startsWith(RECALL_BASE_URL)) {
      return respondToRecallRequest(url.slice(RECALL_BASE_URL.length), init);
    }

    const downloadContent = recall.downloadContentsByUrl[url];

    if (downloadContent !== undefined) {
      return buildJsonResponse(200, downloadContent);
    }

    const downloadContentLength = recall.downloadContentLengthsByUrl[url];

    if (downloadContentLength !== undefined) {
      return buildJsonResponse(
        200,
        {},
        {
          'content-length': String(downloadContentLength),
        },
      );
    }

    throw new Error(`unexpected fetch: ${url}`);
  };

  const respondToRecallRequest = (
    path: string,
    init?: { method?: string },
  ): FakeResponse => {
    if (path.startsWith('/bot/?')) {
      return recall.listStatus === 200
        ? buildJsonResponse(200, { results: recall.listedBots, next: null })
        : buildJsonResponse(
            recall.listStatus,
            { detail: 'list failed' },
            { 'retry-after': '0' },
          );
    }

    if (path.startsWith('/bot/')) {
      const botId = path.slice('/bot/'.length, -1);
      const errorStatus = recall.botStatusesById[botId];

      if (errorStatus !== undefined) {
        return buildJsonResponse(errorStatus, { detail: 'bot error' });
      }

      const botPayload = recall.botPayloadsById[botId];

      if (botPayload === undefined) {
        throw new Error(`unexpected bot fetch: ${botId}`);
      }

      return buildJsonResponse(200, botPayload);
    }

    if (path.startsWith('/transcript/?')) {
      return buildJsonResponse(200, {
        results: recall.transcriptSummaries,
        next: null,
      });
    }

    if (path.startsWith('/transcript/')) {
      const transcriptId = path.slice('/transcript/'.length, -1);
      const transcriptPayload = recall.transcriptPayloadsById[transcriptId];

      if (transcriptPayload === undefined) {
        throw new Error(`unexpected transcript fetch: ${transcriptId}`);
      }

      return buildJsonResponse(200, transcriptPayload);
    }

    if (path.endsWith('/create_transcript/') && init?.method === 'POST') {
      return buildJsonResponse(201, { id: recall.createdTranscriptId });
    }

    if (path.startsWith('/recording/')) {
      const recordingId = path.slice('/recording/'.length, -1);

      return buildJsonResponse(
        200,
        recall.recordingPayloadsById[recordingId] ?? { id: recordingId },
      );
    }

    throw new Error(`unexpected Recall fetch: ${path}`);
  };

  const recallRequestPaths = () =>
    fetchMock.mock.calls
      .map(([url]) => String(url))
      .filter((url) => url.startsWith(RECALL_BASE_URL))
      .map((url) => url.slice(RECALL_BASE_URL.length));

  const fetchedBotIds = () =>
    recallRequestPaths()
      .filter((path) => path.startsWith('/bot/') && !path.startsWith('/bot/?'))
      .map((path) => path.slice('/bot/'.length, -1));

  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
    process.env[RECALL_API_KEY_ENV_VAR_NAME] = 'recall-api-key';
    process.env[RECALL_REGION_ENV_VAR_NAME] = 'us-east-1';
    process.env[CALL_RECORDER_NAME_ENV_VAR_NAME] = 'Call Recorder';
    process.env[APP_ACCESS_TOKEN_ENV_VAR_NAME] =
      buildAppAccessToken(WORKSPACE_ID);
    recall = buildInitialRecallState();
    chargeCreditsMock.mockReset();
    chargeCreditsMock.mockResolvedValue(undefined);
    fetchMock.mockReset();
    fetchMock.mockImplementation(
      async (url: string, init?: { method?: string }) =>
        respondToFetch(String(url), init),
    );
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

  it('does not call Recall when there are no stale database candidates', async () => {
    const result = await convergeDivergedCallRecordings({
      client: buildClient([]) as unknown as CoreApiClient,
      now: NOW,
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.candidateCount).toBe(0);
  });

  it('uses a listed workspace bot without issuing a per-recording read', async () => {
    recall.listedBots = [
      {
        id: 'recall-bot-1',
        metadata: { twentyWorkspaceId: WORKSPACE_ID },
        status_changes: [
          { code: 'in_call_recording', created_at: '2026-06-09T13:02:00.000Z' },
        ],
        recordings: [],
      },
    ];
    const client = buildClient([buildStuckRecordingNode()]);

    const result = await convergeDivergedCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    const listRequestUrl = fetchMock.mock.calls
      .map(([url]) => String(url))
      .find((url) => url.startsWith(`${RECALL_BASE_URL}/bot/?`));

    expect(listRequestUrl).toBeDefined();

    const listRequestParams = new URL(listRequestUrl as string).searchParams;

    expect(listRequestParams.get('join_at_after')).toBe(
      '2026-06-02T12:00:00.000Z',
    );
    expect(listRequestParams.get('join_at_before')).toBe(
      '2026-06-10T13:00:00.000Z',
    );
    expect(listRequestParams.get('metadata__twentyWorkspaceId')).toBe(
      WORKSPACE_ID,
    );
    expect(fetchedBotIds()).toEqual([]);
    expect(result.updatedCallRecordingIds).toEqual(['call-recording-1']);
  });

  it('defers convergence without per-recording fan-out when the bot list fails', async () => {
    recall.listStatus = 429;
    const client = buildClient([buildStuckRecordingNode()]);

    const result = await convergeDivergedCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(fetchedBotIds()).toEqual([]);
    expect(client.mutations).toEqual([]);
    expect(result.candidateCount).toBe(1);
  });

  it('advances the capped fallback by a full batch on each interval', async () => {
    const candidateNodes = Array.from({ length: 27 }, (_, index) =>
      buildStuckRecordingNode({
        id: `call-recording-${index + 1}`,
        externalBotId: `recall-bot-${index + 1}`,
        calendarEvent: null,
        createdAt: null,
      }),
    );

    candidateNodes.forEach((_, index) => {
      recall.botStatusesById[`recall-bot-${index + 1}`] = 400;
    });

    await convergeDivergedCallRecordings({
      client: buildClient(candidateNodes) as unknown as CoreApiClient,
      now: new Date(0),
    });

    expect(fetchedBotIds()).toEqual(
      Array.from({ length: 25 }, (_, index) => `recall-bot-${index + 1}`),
    );

    fetchMock.mockClear();

    await convergeDivergedCallRecordings({
      client: buildClient(candidateNodes) as unknown as CoreApiClient,
      now: new Date(15 * 60 * 1000),
    });

    expect(fetchedBotIds()).toEqual([
      'recall-bot-26',
      'recall-bot-27',
      ...Array.from({ length: 23 }, (_, index) => `recall-bot-${index + 1}`),
    ]);
  });

  it('heals a stuck RECORDING record from the Recall bot state', async () => {
    recall.botPayloadsById['recall-bot-1'] = {
      id: 'recall-bot-1',
      status_changes: [
        { code: 'in_call_recording', created_at: '2026-06-09T13:02:30.000Z' },
        { code: 'call_ended', created_at: '2026-06-09T14:00:30.000Z' },
        { code: 'done', created_at: '2026-06-09T14:05:00.000Z' },
      ],
      recordings: [buildDoneRecording()],
    };
    const client = buildClient([buildStuckRecordingNode()]);

    const result = await convergeDivergedCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(fetchedBotIds()).toEqual(['recall-bot-1']);
    expect(recallRequestPaths()).toContain(
      '/transcript/?recording_id=recall-recording-1',
    );
    expect(recallRequestPaths()).toContain(
      '/recording/recall-recording-1/create_transcript/',
    );
    expect(recallRequestPaths()).toContain('/recording/recall-recording-1/');
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
      unconvergeableCallRecordingIds: [],
      skippedNotStartedCallRecordingIds: [],
    });
  });

  it('marks FAILED when Recall is done but has no recording artifact path', async () => {
    recall.botPayloadsById['recall-bot-1'] = {
      id: 'recall-bot-1',
      status_changes: [
        { code: 'done', created_at: '2026-06-09T14:05:00.000Z' },
      ],
      recordings: [],
    };
    const client = buildClient([buildStuckRecordingNode()]);

    const result = await convergeDivergedCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(
      recallRequestPaths().filter(
        (path) =>
          path.startsWith('/transcript/') || path.startsWith('/recording/'),
      ),
    ).toEqual([]);
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

  it('marks NOT_RECORDED instead of FAILED when nobody joined the call', async () => {
    recall.botPayloadsById['recall-bot-1'] = {
      id: 'recall-bot-1',
      status_changes: [
        { code: 'joining_call', created_at: '2026-06-09T12:58:00.000Z' },
        { code: 'in_waiting_room', created_at: '2026-06-09T12:59:00.000Z' },
        {
          code: 'call_ended',
          sub_code: 'timeout_exceeded_waiting_room',
          created_at: '2026-06-09T13:19:00.000Z',
        },
        { code: 'done', created_at: '2026-06-09T13:20:00.000Z' },
      ],
      recordings: [],
    };
    const client = buildClient([
      buildStuckRecordingNode({
        status: 'JOINING',
        startedAt: '2026-06-09T13:00:00.000Z',
        endedAt: '2026-06-09T13:15:00.000Z',
      }),
    ]);

    const result = await convergeDivergedCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(client.mutations).toEqual([
      {
        id: 'call-recording-1',
        data: {
          status: 'NOT_RECORDED',
          callRecorderFailureReason: 'timeout_exceeded_waiting_room',
          startedAt: null,
          endedAt: null,
        },
      },
    ]);
    expect(result.updatedCallRecordingIds).toEqual(['call-recording-1']);
  });

  it('does not fail a completed bot sync when a persisted artifact remains reachable', async () => {
    recall.botPayloadsById['recall-bot-1'] = {
      id: 'recall-bot-1',
      status_changes: [
        { code: 'done', created_at: '2026-06-09T14:05:00.000Z' },
      ],
      recordings: [],
    };
    const client = buildClient([
      buildStuckRecordingNode({
        audio: [{ fileId: 'file-audio-1', label: 'audio.mp3' }],
      }),
    ]);

    await convergeDivergedCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(client.mutations).toEqual([
      {
        id: 'call-recording-1',
        data: { status: 'PROCESSING' },
      },
    ]);
  });

  it('completes and charges when the missing video is marked too large', async () => {
    recall.botPayloadsById['recall-bot-1'] = {
      id: 'recall-bot-1',
      status_changes: [
        { code: 'done', created_at: '2026-06-09T14:05:00.000Z' },
      ],
      recordings: [buildDoneRecording()],
    };
    recall.recordingPayloadsById['recall-recording-1'] = {
      id: 'recall-recording-1',
      media_shortcuts: {
        video_mixed: { data: { download_url: VIDEO_DOWNLOAD_URL } },
      },
    };
    recall.downloadContentLengthsByUrl[VIDEO_DOWNLOAD_URL] = 600 * 1024 * 1024;
    const client = buildClient([
      buildStuckRecordingNode({
        status: 'PROCESSING',
        startedAt: '2026-06-09T13:02:00.000Z',
        endedAt: '2026-06-09T14:00:00.000Z',
        externalRecordingId: 'recall-recording-1',
        transcript: [{ participant: { id: 1 }, words: [] }],
        audio: [{ fileId: 'file-audio-1', label: 'audio.mp3' }],
      }),
    ]);

    const result = await convergeDivergedCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(client.mutations).toEqual([
      {
        id: 'call-recording-1',
        data: {
          callRecorderFailureReason: 'video_file_too_large',
        },
      },
      {
        id: 'call-recording-1',
        data: { status: 'COMPLETED' },
      },
    ]);
    expect(chargeCreditsMock).toHaveBeenCalledWith(EXPECTED_CHARGE);
    expect(result.updatedCallRecordingIds).toEqual(['call-recording-1']);
  });

  it('completes from a persisted size marker once the transcript lands', async () => {
    recall.botPayloadsById['recall-bot-1'] = {
      id: 'recall-bot-1',
      status_changes: [
        { code: 'done', created_at: '2026-06-09T14:05:00.000Z' },
      ],
      recordings: [buildDoneRecording()],
    };
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

    const result = await convergeDivergedCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(recallRequestPaths()).toContain('/recording/recall-recording-1/');
    expect(client.mutations).toEqual([
      {
        id: 'call-recording-1',
        data: { status: 'COMPLETED' },
      },
    ]);
    expect(chargeCreditsMock).toHaveBeenCalledWith(EXPECTED_CHARGE);
    expect(result.updatedCallRecordingIds).toEqual(['call-recording-1']);
  });

  it('keeps the real failure reason over the size marker when the bot failed', async () => {
    recall.botPayloadsById['recall-bot-1'] = {
      id: 'recall-bot-1',
      status_changes: [
        { code: 'fatal', created_at: '2026-06-09T14:05:00.000Z' },
      ],
      recordings: [buildDoneRecording()],
    };
    recall.recordingPayloadsById['recall-recording-1'] = {
      id: 'recall-recording-1',
      media_shortcuts: {
        video_mixed: { data: { download_url: VIDEO_DOWNLOAD_URL } },
      },
    };
    recall.downloadContentLengthsByUrl[VIDEO_DOWNLOAD_URL] = 600 * 1024 * 1024;
    const client = buildClient([
      buildStuckRecordingNode({
        status: 'PROCESSING',
        startedAt: '2026-06-09T13:02:00.000Z',
        endedAt: '2026-06-09T14:00:00.000Z',
        externalRecordingId: 'recall-recording-1',
        transcript: [{ participant: { id: 1 }, words: [] }],
        audio: [{ fileId: 'file-audio-1', label: 'audio.mp3' }],
      }),
    ]);

    await convergeDivergedCallRecordings({
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

    const result = await convergeDivergedCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(fetchedBotIds()).toEqual([]);
    expect(client.mutations).toEqual([]);
    expect(result.skippedNotStartedCallRecordingIds).toEqual([
      'call-recording-1',
    ]);
  });

  it('converges a meeting that ended early while its scheduled end is still in the future', async () => {
    recall.botPayloadsById['recall-bot-1'] = {
      id: 'recall-bot-1',
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
    };
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

    expect(fetchedBotIds()).toEqual(['recall-bot-1']);
    expect(result.updatedCallRecordingIds).toEqual(['call-recording-1']);
    expect(result.skippedNotStartedCallRecordingIds).toEqual([]);
  });

  it('marks FAILED without clearing the bot id when Recall returns 404', async () => {
    recall.botStatusesById['recall-bot-1'] = 404;
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
          callRecorderFailureReason: 'recall_bot_not_found',
        },
      },
    ]);
    expect(result.markedFailedCallRecordingIds).toEqual(['call-recording-1']);
    expect(console.warn).toHaveBeenCalled();
  });

  it('does not downgrade a COMPLETED record when its bot 404s', async () => {
    recall.botStatusesById['recall-bot-1'] = 404;
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

    expect(fetchedBotIds()).toEqual([]);
    expect(client.mutations).toEqual([]);
    expect(result.unconvergeableCallRecordingIds).toEqual(['call-recording-1']);
    expect(console.warn).toHaveBeenCalled();
  });

  it('converges candidates created long before a recently ended meeting', async () => {
    recall.botPayloadsById['recall-bot-1'] = {
      id: 'recall-bot-1',
      status_changes: [
        { code: 'in_call_recording', created_at: '2026-06-09T13:02:00.000Z' },
      ],
      recordings: [],
    };
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

    expect(fetchedBotIds()).toEqual(['recall-bot-1']);
    expect(result.unconvergeableCallRecordingIds).toEqual([]);
  });

  it('applies the downgrade guard to pulled statuses while still filling timestamps', async () => {
    recall.botPayloadsById['recall-bot-1'] = {
      id: 'recall-bot-1',
      status_changes: [
        { code: 'in_call_recording', created_at: '2026-06-09T13:02:00.000Z' },
      ],
      recordings: [
        { id: 'recall-recording-1', started_at: '2026-06-09T13:02:00.000Z' },
      ],
    };
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
    recall.botPayloadsById['recall-bot-1'] = {
      id: 'recall-bot-1',
      status_changes: [
        { code: 'done', created_at: '2026-06-09T14:05:00.000Z' },
      ],
      recordings: [buildDoneRecording()],
    };
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

    expect(
      recallRequestPaths().filter(
        (path) => path === '/recording/recall-recording-1/create_transcript/',
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
    recall.botPayloadsById['recall-bot-1'] = {
      id: 'recall-bot-1',
      status_changes: [
        { code: 'done', created_at: '2026-06-09T14:05:00.000Z' },
      ],
      recordings: [buildDoneRecording()],
    };
    recall.transcriptSummaries = [
      { id: 'recall-transcript-1', status: { code: 'processing' } },
    ];
    const client = buildClient([buildStuckRecordingNode()]);

    const result = await convergeDivergedCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(
      recallRequestPaths().filter(
        (path) =>
          path.endsWith('/create_transcript/') ||
          path === '/transcript/recall-transcript-1/',
      ),
    ).toEqual([]);
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

    recall.botPayloadsById['recall-bot-1'] = {
      id: 'recall-bot-1',
      status_changes: [
        { code: 'done', created_at: '2026-06-09T14:05:00.000Z' },
      ],
      recordings: [buildDoneRecording()],
    };
    recall.transcriptSummaries = [
      { id: 'recall-transcript-1', status: { code: 'done' } },
    ];
    recall.transcriptPayloadsById['recall-transcript-1'] = {
      data: { download_url: TRANSCRIPT_DOWNLOAD_URL },
      status: { code: 'done' },
    };
    recall.downloadContentsByUrl[TRANSCRIPT_DOWNLOAD_URL] = transcriptContent;
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

    expect(
      recallRequestPaths().filter((path) =>
        path.endsWith('/create_transcript/'),
      ),
    ).toEqual([]);
    expect(recallRequestPaths()).toContain('/transcript/recall-transcript-1/');
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
    expect(chargeCreditsMock).toHaveBeenCalledWith(EXPECTED_CHARGE);
    expect(result.requestedTranscriptCallRecordingIds).toEqual([]);
  });

  it('marks the call recording failed when Recall has a failed transcript artifact', async () => {
    recall.botPayloadsById['recall-bot-1'] = {
      id: 'recall-bot-1',
      status_changes: [
        { code: 'done', created_at: '2026-06-09T14:05:00.000Z' },
      ],
      recordings: [buildDoneRecording()],
    };
    recall.transcriptSummaries = [
      {
        id: 'recall-transcript-1',
        status: { code: 'failed', sub_code: 'audio_missing' },
      },
    ];
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

    expect(
      recallRequestPaths().filter(
        (path) =>
          path.endsWith('/create_transcript/') ||
          path === '/transcript/recall-transcript-1/',
      ),
    ).toEqual([]);
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
    recall.botPayloadsById['recall-bot-1'] = {
      id: 'recall-bot-1',
      status_changes: [
        { code: 'in_call_recording', created_at: '2026-06-09T13:02:00.000Z' },
      ],
      recordings: [],
    };
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
