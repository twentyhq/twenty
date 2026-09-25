import { randomUUID } from 'crypto';

import { isNull, isUndefined } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { getJobs } from 'twenty-sdk/logic-function';
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  APPLICATION_UNIVERSAL_IDENTIFIER,
  CHECK_CREDITS_BEFORE_RECALL_BOT_JOIN_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  STALE_BOT_STATE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { type CallRecorderPreference } from 'src/constants/call-recorder-preference';
import { reconcileStaleBotStateHandler } from 'src/logic-functions/reconcile-stale-bot-state';
import { CALL_RECORDER_CALENDAR_BOT_SCHEDULING_ENABLED_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-calendar-bot-scheduling-enabled-env-var-name';
import { CALENDAR_EVENT_UPDATE_BATCH_SIZE } from 'src/logic-functions/constants/calendar-event-update-batch-size';
import { cancelCallRecordingRequest } from 'src/logic-functions/flows/cancel-call-recording-request.util';
import { enqueueCallRecordingArtifactsImport } from 'src/logic-functions/data/enqueue-call-recording-artifacts-import.util';
import { saveCallRecordingImportProgress } from 'src/logic-functions/data/save-call-recording-import-progress.util';
import { convergeDivergedCallRecordings } from 'src/logic-functions/flows/converge-diverged-call-recordings.util';
import { handleCallRecordingArtifactsImportJob } from 'src/logic-functions/flows/handle-call-recording-artifacts-import-job.util';
import { handlePreJoinCreditCheckJob } from 'src/logic-functions/flows/handle-pre-join-credit-check-job.util';
import { enqueuePreJoinCreditCheck } from 'src/logic-functions/data/enqueue-pre-join-credit-check.util';
import { PRE_JOIN_CREDIT_CHECK_LEAD_MINUTES } from 'src/logic-functions/constants/pre-join-credit-check-lead-minutes';
import { reconcileCallRecorderForCalendarEventIds } from 'src/logic-functions/flows/reconcile-call-recorder.util';
import { retryFailedRecallCancellations } from 'src/logic-functions/flows/retry-failed-recall-cancellations.util';
import { scheduleRecallBotsForPendingCallRecordings } from 'src/logic-functions/flows/schedule-recall-bots-for-pending-call-recordings.util';
import { processRecallWebhookHandler } from 'src/logic-functions/process-recall-webhook';
import { cancelScheduledRecallBotsHandler } from 'src/logic-functions/cancel-scheduled-recall-bots';
import { cancelScheduledRecallBots } from 'src/logic-functions/flows/cancel-scheduled-recall-bots.util';
import { syncCalendarBotSchedulingHandler } from 'src/logic-functions/sync-calendar-bot-scheduling';
import reconcileCalendarEventLogicFunction from 'src/logic-functions/reconcile-call-recorder-calendar-event';

// ---------------------------------------------------------------------------
// Call Recorder end-to-end behavior against a live Twenty server.
//
// The app is installed on the test server by the vitest global setup, and all
// reads and writes go through the real API into the test database. Lifecycle
// scenarios control delivery order with fakes for:
//   - the Recall API (a fetch interceptor that replays the same bot for a
//     repeated Idempotency-Key, like the real API),
//   - the trigger transports: webhook deliveries invoke the webhook logic
//     function handler directly, and cron / database-event triggers invoke
//     the flows they dispatch, including queued artifact imports.
//
// Queue scenarios bypass those fakes and use the installed app's real worker.
//
// The suite issues a few hundred API requests; if the test server runs with
// the default API_RATE_LIMITING_LONG_LIMIT of 100 requests per minute,
// raise it (e.g. to 100000) or the runs trip the limiter.
// ---------------------------------------------------------------------------

const WORKSPACE_API_KEY_ENV = 'TWENTY_API_KEY';
const RECALL_BASE_URL = 'https://us-west-2.recall.ai/api/v1';
const RESTRICTED_TITLE_PLACEHOLDER =
  'FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED';

// The app's generated client only covers the objects the app uses, but test
// fixture discovery needs fields that are not part of the app schema; this
// hits the workspace GraphQL API directly with the test API key.
const workspaceGraphql = async (
  query: string,
  variables: Record<string, unknown> = {},
): Promise<any> => {
  const response = await fetch(`${process.env.TWENTY_API_URL}/graphql`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env[WORKSPACE_API_KEY_ENV]}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });
  const payload = await response.json();

  if (payload.errors !== undefined) {
    throw new Error(
      `Workspace GraphQL request failed: ${JSON.stringify(payload.errors)}`,
    );
  }

  return payload.data;
};

const metadataGraphql = async <TData>(
  query: string,
  variables: Record<string, unknown>,
): Promise<TData> => {
  const response = await fetch(`${process.env.TWENTY_API_URL}/metadata`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env[WORKSPACE_API_KEY_ENV]}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });
  const payload = (await response.json()) as {
    data: TData;
    errors?: unknown[];
  };

  if (!isUndefined(payload.errors)) {
    throw new Error(
      `Metadata GraphQL request failed: ${JSON.stringify(payload.errors)}`,
    );
  }

  return payload.data;
};

const fetchApplicationAccessToken = async (): Promise<string> => {
  const {
    findApplicationRegistrationByUniversalIdentifier: applicationRegistration,
  } = await metadataGraphql<{
    findApplicationRegistrationByUniversalIdentifier: {
      id: string;
      oAuthClientId: string;
    } | null;
  }>(
    `query FindApplicationRegistration($universalIdentifier: String!) {
      findApplicationRegistrationByUniversalIdentifier(
        universalIdentifier: $universalIdentifier
      ) {
        id
        oAuthClientId
      }
    }`,
    { universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER },
  );

  if (isNull(applicationRegistration)) {
    throw new Error('Call recorder is not registered');
  }

  const {
    rotateApplicationRegistrationClientSecret: { clientSecret },
  } = await metadataGraphql<{
    rotateApplicationRegistrationClientSecret: { clientSecret: string };
  }>(
    `mutation RotateApplicationRegistrationClientSecret($id: String!) {
      rotateApplicationRegistrationClientSecret(id: $id) {
        clientSecret
      }
    }`,
    { id: applicationRegistration.id },
  );
  const response = await fetch(`${process.env.TWENTY_API_URL}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: applicationRegistration.oAuthClientId,
      client_secret: clientSecret,
    }),
  });
  const tokenResponse = (await response.json()) as {
    access_token?: string;
    error_description?: string;
  };

  if (!response.ok || isUndefined(tokenResponse.access_token)) {
    throw new Error(
      `Client credentials exchange failed: ${tokenResponse.error_description ?? response.statusText}`,
    );
  }

  return tokenResponse.access_token;
};

type CalendarEventFixture = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  iCalUid: string;
  isCanceled: boolean;
  isFullDay: boolean;
  callRecorderPreference: CallRecorderPreference | null;
  conferenceLink: {
    primaryLinkLabel: string;
    primaryLinkUrl: string;
    secondaryLinks: Array<{ label: string; url: string }> | null;
  };
};

const discoverVisibleCalendarEventFixtures = async (): Promise<
  CalendarEventFixture[]
> => {
  const fixtures: CalendarEventFixture[] = [];
  let after: string | null = null;

  do {
    const eventsData = await workspaceGraphql(
      `query ($after: String) {
        calendarEvents(first: 200, after: $after) {
          edges {
            node {
              id
              title
              startsAt
              endsAt
              iCalUid
              isCanceled
              isFullDay
              callRecorderPreference
              conferenceLink {
                primaryLinkLabel
                primaryLinkUrl
                secondaryLinks { label url }
              }
            }
          }
          pageInfo { hasNextPage endCursor }
        }
      }`,
      { after },
    );
    const connection = eventsData.calendarEvents;

    fixtures.push(
      ...connection.edges
        .map((edge: any) => edge.node)
        .filter(
          (node: CalendarEventFixture) =>
            node.title !== RESTRICTED_TITLE_PLACEHOLDER &&
            /^event\d+@calendar\.twentycrm\.com$/.test(node.iCalUid),
        ),
    );

    after = connection.pageInfo.hasNextPage
      ? connection.pageInfo.endCursor
      : null;
  } while (after !== null);

  if (fixtures.length === 0) {
    throw new Error(
      'No fully visible seeded calendar events found; run the dev seeds before the integration tests',
    );
  }

  return fixtures;
};

const inOneHour = () => new Date(Date.now() + 60 * 60 * 1000).toISOString();
const inTwoHours = () =>
  new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
const hoursAgo = (hours: number) =>
  new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
const daysAgo = (days: number) => hoursAgo(days * 24);

// ---------------------------------------------------------------------------
// Recall API fake, installed as a fetch interceptor. Twenty API traffic falls
// through to the real fetch, except the metadata enqueueJobs mutation, which is
// captured here so fanned-out jobs do not run inside the test.
// ---------------------------------------------------------------------------

type FakeRecallBotStatusChange = {
  code: string;
  sub_code?: string;
  created_at: string;
};

type FakeRecallBot = {
  id: string;
  metadata: Record<string, string>;
  statusCode: string;
  statusChanges?: FakeRecallBotStatusChange[];
  recordings?: Array<{ id: string; started_at: string; completed_at: string }>;
};

type FakeRecallTranscript = {
  id: string;
  statusCode: string;
  content: unknown;
};

const FAKE_RECALL_DOWNLOAD_BASE_URL = `${RECALL_BASE_URL}/fake-downloads`;

const MP4_FILE_HEADER_BYTES = Uint8Array.from([
  0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d, 0x00,
  0x00, 0x02, 0x00, 0x69, 0x73, 0x6f, 0x6d, 0x69, 0x73, 0x6f, 0x32,
]);
const MP3_FRAME_HEADER_BYTES = Uint8Array.from([
  0xff,
  0xfb,
  0x90,
  0x64,
  ...new Array(412).fill(0),
]);

class FakeRecallApi {
  bots = new Map<string, FakeRecallBot>();
  botIdByIdempotencyKey = new Map<string, string>();
  transcripts = new Map<string, FakeRecallTranscript>();
  transcriptRequestFailureStatus: number | undefined = undefined;
  failVideoDownload = false;
  mediaContentLengthBytes: number | undefined = undefined;
  deletedBotIds: string[] = [];
  listRequestCount = 0;
  artifactImportRequests: object[] = [];
  activeArtifactJobIds = new Set<string>();
  recoveryRequests: object[] = [];
  creditCheckRequests: object[] = [];
  // Undefined lets the credit verdict fall through to the real server.
  creditAvailability:
    | { hasAvailableCredits: true }
    | { hasAvailableCredits: false; reason: string }
    | undefined = undefined;
  hasExpiredMedia = false;
  failNextDelete = false;
  failCalendarEventUpdates = false;
  failRecallRemovals = false;

  seedBot(bot: FakeRecallBot): void {
    this.bots.set(bot.id, bot);
  }

  completeTranscripts(content: unknown): void {
    for (const transcript of this.transcripts.values()) {
      transcript.statusCode = 'done';
      transcript.content = content;
    }
  }

  // Mirrors Recall after retention: the bot history ends with media_expired,
  // the recording disappears from the bot, and its transcripts read as deleted.
  expireBotMedia({
    botId,
    recordingStartedAt,
    recordingEndedAt,
  }: {
    botId: string;
    recordingStartedAt: string;
    recordingEndedAt: string;
  }): void {
    const bot = this.finishBotRecording({
      botId,
      recordingStartedAt,
      recordingEndedAt,
    });

    this.hasExpiredMedia = true;
    bot.statusCode = 'media_expired';
    bot.statusChanges = [
      ...(bot.statusChanges ?? []),
      { code: 'media_expired', created_at: new Date().toISOString() },
    ];
    bot.recordings = [];

    for (const transcript of this.transcripts.values()) {
      transcript.statusCode = 'deleted';
    }
  }

  // Mirrors Recall after a call the app never heard the end of: the bot
  // history and its recording are complete, but no webhook reached the app.
  finishBotRecording({
    botId,
    recordingStartedAt,
    recordingEndedAt,
  }: {
    botId: string;
    recordingStartedAt: string;
    recordingEndedAt: string;
  }): FakeRecallBot {
    const bot = this.bots.get(botId);

    if (bot === undefined) {
      throw new Error(`Unknown fake Recall bot ${botId}`);
    }

    bot.statusCode = 'done';
    bot.statusChanges = [
      { code: 'in_call_recording', created_at: recordingStartedAt },
      {
        code: 'call_ended',
        sub_code: 'timeout_exceeded_everyone_left',
        created_at: recordingEndedAt,
      },
      { code: 'done', created_at: recordingEndedAt },
    ];
    bot.recordings = [
      {
        id: 'recall-recording-1',
        started_at: recordingStartedAt,
        completed_at: recordingEndedAt,
      },
    ];

    return bot;
  }

  botForCallRecording(callRecordingId: string): FakeRecallBot | undefined {
    return [...this.bots.values()].find(
      (bot) => bot.metadata.twentyCallRecordingId === callRecordingId,
    );
  }

  handle(requestUrl: string, requestInit?: any): Response | undefined {
    const method: string = requestInit?.method ?? 'GET';

    if (
      requestUrl === `${process.env.TWENTY_API_URL}/app/billing/credits` &&
      this.creditAvailability !== undefined
    ) {
      return jsonResponse(200, this.creditAvailability);
    }

    if (
      requestUrl === `${process.env.TWENTY_API_URL}/metadata` &&
      String(requestInit?.body ?? '').includes('getJobs')
    ) {
      const sentBody: { variables?: Record<string, string[]> } = JSON.parse(
        requestInit?.body ?? '{}',
      );
      const requestedJobIds = Object.values(sentBody.variables ?? {}).flat();

      return jsonResponse(200, {
        data: {
          getJobs: [...this.activeArtifactJobIds]
            .filter((jobId) => requestedJobIds.includes(jobId))
            .map((jobId) => ({ jobId, state: 'ACTIVE' })),
        },
      });
    }

    // Capture the artifact-import enqueue instead of letting the job run.
    if (
      requestUrl === `${process.env.TWENTY_API_URL}/metadata` &&
      String(requestInit?.body ?? '').includes('enqueueJobs')
    ) {
      const sentBody = JSON.parse(requestInit?.body ?? '{}');
      const [input] = Object.values(sentBody.variables ?? {}) as {
        logicFunctionUniversalIdentifier: string;
        payloads: object[];
        jobs?: { jobId: string; payload: object }[];
      }[];
      const payloads =
        input?.jobs?.map(({ payload }) => payload) ?? input?.payloads ?? [];

      if (
        input?.logicFunctionUniversalIdentifier ===
        STALE_BOT_STATE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER
      ) {
        this.recoveryRequests.push(...payloads);
      } else if (
        input?.logicFunctionUniversalIdentifier ===
        CHECK_CREDITS_BEFORE_RECALL_BOT_JOIN_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER
      ) {
        this.creditCheckRequests.push(...payloads);
      } else {
        this.artifactImportRequests.push(...payloads);
      }

      return jsonResponse(200, {
        data: {
          enqueueJobs: {
            enqueued: true,
            logicFunctionUniversalIdentifier:
              input?.logicFunctionUniversalIdentifier ?? '',
            enqueuedJobsCount: payloads.length,
            jobIds: input?.jobs?.map(({ jobId }) => jobId) ?? [],
          },
        },
      });
    }

    if (
      this.failCalendarEventUpdates &&
      requestUrl === `${process.env.TWENTY_API_URL}/graphql` &&
      String(requestInit?.body ?? '').includes('updateCalendarEvents')
    ) {
      return jsonResponse(500, { errors: [{ message: 'Internal error' }] });
    }

    if (!requestUrl.startsWith(RECALL_BASE_URL)) {
      return undefined;
    }

    if (method === 'POST' && requestUrl === `${RECALL_BASE_URL}/bot/`) {
      return this.createBot(requestInit);
    }

    if (method === 'GET' && requestUrl.startsWith(`${RECALL_BASE_URL}/bot/?`)) {
      this.listRequestCount += 1;

      return jsonResponse(200, {
        next: null,
        results: [...this.bots.values()].map((bot) => ({
          id: bot.id,
          metadata: bot.metadata,
          status: { code: bot.statusCode },
          status_changes: bot.statusChanges ?? [],
          recordings: bot.recordings ?? [],
        })),
      });
    }

    const botIdMatch = requestUrl.match(/\/bot\/([^/]+)\/$/);

    if (method === 'GET' && botIdMatch !== null) {
      const bot = this.bots.get(botIdMatch[1]);

      if (bot === undefined) {
        return jsonResponse(404, {});
      }

      return jsonResponse(200, {
        id: bot.id,
        metadata: bot.metadata,
        status: { code: bot.statusCode },
        status_changes: bot.statusChanges ?? [],
        recordings: bot.recordings ?? [],
      });
    }

    const ejectedBotIdMatch = requestUrl.match(/\/bot\/([^/]+)\/leave_call\/$/);

    if (method === 'POST' && ejectedBotIdMatch !== null) {
      if (this.failRecallRemovals) {
        return jsonResponse(400, {});
      }

      this.bots.delete(ejectedBotIdMatch[1]);
      this.deletedBotIds.push(ejectedBotIdMatch[1]);

      return new Response(null, { status: 204 });
    }

    if (method === 'DELETE' && botIdMatch !== null) {
      if (this.failNextDelete || this.failRecallRemovals) {
        this.failNextDelete = false;

        return jsonResponse(400, {});
      }

      this.bots.delete(botIdMatch[1]);
      this.deletedBotIds.push(botIdMatch[1]);

      return new Response(null, { status: 204 });
    }

    if (
      method === 'POST' &&
      /\/recording\/[^/]+\/create_transcript\/$/.test(requestUrl)
    ) {
      if (this.hasExpiredMedia) return jsonResponse(404, {});

      if (this.transcriptRequestFailureStatus !== undefined) {
        return jsonResponse(this.transcriptRequestFailureStatus, {});
      }

      const transcript: FakeRecallTranscript = {
        id: `recall-transcript-${this.transcripts.size + 1}`,
        statusCode: 'processing',
        content: undefined,
      };

      this.transcripts.set(transcript.id, transcript);

      return jsonResponse(200, { id: transcript.id });
    }

    if (
      method === 'GET' &&
      requestUrl.startsWith(`${RECALL_BASE_URL}/transcript/?`)
    ) {
      return jsonResponse(200, {
        next: null,
        results: [...this.transcripts.values()].map((transcript) => ({
          id: transcript.id,
          status: { code: transcript.statusCode },
        })),
      });
    }

    const transcriptIdMatch = requestUrl.match(/\/transcript\/([^/?]+)\/$/);

    if (method === 'GET' && transcriptIdMatch !== null) {
      const transcript = this.transcripts.get(transcriptIdMatch[1]);

      if (transcript === undefined) {
        return jsonResponse(404, {});
      }

      return jsonResponse(200, {
        id: transcript.id,
        status: { code: transcript.statusCode },
        data: {
          download_url:
            transcript.statusCode === 'done'
              ? `${FAKE_RECALL_DOWNLOAD_BASE_URL}/transcripts/${transcript.id}.json`
              : null,
        },
      });
    }

    const transcriptDownloadMatch = requestUrl.match(
      /\/fake-downloads\/transcripts\/([^/]+)\.json$/,
    );

    if (method === 'GET' && transcriptDownloadMatch !== null) {
      const transcript = this.transcripts.get(transcriptDownloadMatch[1]);

      return new Response(JSON.stringify(transcript?.content ?? null), {
        status: 200,
      });
    }

    if (method === 'GET' && /\/recording\/[^/]+\/$/.test(requestUrl)) {
      if (this.hasExpiredMedia) return jsonResponse(404, {});
      return jsonResponse(200, {
        media_shortcuts: {
          video_mixed: {
            download_url: `${FAKE_RECALL_DOWNLOAD_BASE_URL}/media/video.mp4`,
          },
          audio_mixed: {
            download_url: `${FAKE_RECALL_DOWNLOAD_BASE_URL}/media/audio.mp3`,
          },
        },
      });
    }

    if (
      method === 'GET' &&
      requestUrl.startsWith(`${FAKE_RECALL_DOWNLOAD_BASE_URL}/media/`)
    ) {
      if (this.failVideoDownload && requestUrl.endsWith('.mp4')) {
        return jsonResponse(500, {});
      }

      // Twenty checks uploads by magic bytes, so the fake media needs real headers.
      const mediaBytes = requestUrl.endsWith('.mp4')
        ? MP4_FILE_HEADER_BYTES
        : MP3_FRAME_HEADER_BYTES;

      return new Response(mediaBytes, {
        status: 200,
        headers: {
          'content-length': String(
            this.mediaContentLengthBytes ?? mediaBytes.byteLength,
          ),
        },
      });
    }

    throw new Error(`Unhandled Recall API request: ${method} ${requestUrl}`);
  }

  private createBot(requestInit: any): Response {
    const idempotencyKey: string | undefined =
      requestInit?.headers?.['Idempotency-Key'];
    const alreadyCreatedBotId =
      idempotencyKey === undefined
        ? undefined
        : this.botIdByIdempotencyKey.get(idempotencyKey);

    if (alreadyCreatedBotId !== undefined) {
      return jsonResponse(200, { id: alreadyCreatedBotId });
    }

    const body = JSON.parse(requestInit?.body ?? '{}');
    const bot: FakeRecallBot = {
      id: `recall-bot-${randomUUID()}`,
      metadata: body.metadata ?? {},
      statusCode: 'ready',
    };

    this.bots.set(bot.id, bot);

    if (idempotencyKey !== undefined) {
      this.botIdByIdempotencyKey.set(idempotencyKey, bot.id);
    }

    return jsonResponse(201, { id: bot.id });
  }
}

const jsonResponse = (status: number, body: object): Response =>
  new Response(JSON.stringify(body), { status });

// ---------------------------------------------------------------------------
// Recall webhook payloads, mirroring the shapes Recall actually delivers.
// ---------------------------------------------------------------------------

const buildBotMetadata = (callRecordingId: string, workspaceId: string) => ({
  twentyWorkspaceId: workspaceId,
  twentyCallRecordingId: callRecordingId,
});

const buildBotStatusChangeWebhook = ({
  botId,
  metadata,
  statusCode,
  statusSubCode,
  statusTimestamp,
}: {
  botId: string;
  metadata: Record<string, string>;
  statusCode: string;
  statusSubCode?: string;
  statusTimestamp?: string;
}) => ({
  event: 'bot.status_change',
  data: {
    bot_id: botId,
    status: {
      code: statusCode,
      ...(statusSubCode === undefined ? {} : { sub_code: statusSubCode }),
      created_at: statusTimestamp ?? new Date().toISOString(),
    },
    bot: { id: botId, metadata },
  },
});

const buildRecordingDoneWebhook = ({
  botId,
  metadata,
  startedAt,
  completedAt,
}: {
  botId: string;
  metadata: Record<string, string>;
  startedAt: string;
  completedAt: string;
}) => ({
  event: 'recording.done',
  data: {
    bot: { id: botId, metadata },
    recording: {
      id: 'recall-recording-1',
      started_at: startedAt,
      completed_at: completedAt,
    },
  },
});

const buildRecordingDeletedWebhook = ({
  botId,
  metadata,
}: {
  botId: string;
  metadata: Record<string, string>;
}) => ({
  event: 'recording.deleted',
  data: {
    bot: { id: botId, metadata },
    recording: { id: 'recall-recording-1' },
  },
});

const buildTranscriptDoneWebhook = ({
  botId,
  metadata,
}: {
  botId: string;
  metadata: Record<string, string>;
}) => ({
  event: 'transcript.done',
  data: {
    bot: { id: botId, metadata },
    transcript: { id: 'recall-transcript-1' },
  },
});

// ---------------------------------------------------------------------------
// Test workspace helpers: real rows in the test database, cleaned up or
// restored after each scenario.
// ---------------------------------------------------------------------------

describe('call recorder app lifecycle (integration)', () => {
  // Built before the fetch interceptor is installed so the shared client's
  // Twenty API traffic always uses the real fetch.
  let client: CoreApiClient;
  let applicationAccessToken: string;
  let workspaceId: string;
  let availableCalendarEventFixtures: CalendarEventFixture[];
  let nextCalendarEventFixtureIndex = 0;
  let recall: FakeRecallApi;
  const borrowedCalendarEventFixtures: CalendarEventFixture[] = [];
  const createdCallRecordingIds: string[] = [];

  const readWorkspaceIdFromApiKey = (): string => {
    const apiKey = process.env[WORKSPACE_API_KEY_ENV] ?? '';
    const payload = JSON.parse(
      Buffer.from(apiKey.split('.')[1] ?? '', 'base64url').toString('utf8'),
    );

    return payload.workspaceId;
  };

  beforeAll(async () => {
    client = new CoreApiClient();
    workspaceId = readWorkspaceIdFromApiKey();
    availableCalendarEventFixtures =
      await discoverVisibleCalendarEventFixtures();
    applicationAccessToken = await fetchApplicationAccessToken();
  });

  beforeEach(() => {
    recall = new FakeRecallApi();
    nextArtifactImportRequestIndex = 0;

    const realFetch = globalThis.fetch;

    vi.stubGlobal(
      'fetch',
      (requestUrl: any, requestInit?: any): Promise<Response> => {
        const intercepted =
          typeof requestUrl === 'string'
            ? recall.handle(requestUrl, requestInit)
            : undefined;

        return intercepted !== undefined
          ? Promise.resolve(intercepted)
          : realFetch(requestUrl, requestInit);
      },
    );
    vi.stubEnv('RECALL_API_KEY', 'recall-api-key');
    vi.stubEnv('RECALL_REGION', 'us-west-2');
    vi.stubEnv('CALL_RECORDER_USE_WORKSPACE_LOGO', 'false');
    // Logic functions normally run with an app access token; the workspace
    // API key is a token with the same workspaceId claim.
    vi.stubEnv(
      'TWENTY_APP_ACCESS_TOKEN',
      process.env[WORKSPACE_API_KEY_ENV] ?? '',
    );
  });

  afterEach(async () => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();

    await destroyCreatedRows();
  });

  const destroyCreatedRows = async (): Promise<void> => {
    const calendarEventRestoreErrors: Error[] = [];
    const borrowedCalendarEventIds = borrowedCalendarEventFixtures.map(
      ({ id }) => id,
    );
    const callRecordingsForCreatedCalendarEvents =
      borrowedCalendarEventIds.length === 0
        ? []
        : await findCallRecordings({
            calendarEventId: { in: borrowedCalendarEventIds },
          });
    const callRecordingIds = [
      ...new Set([
        ...createdCallRecordingIds,
        ...callRecordingsForCreatedCalendarEvents.map(({ id }) => id),
      ]),
    ];

    for (const callRecordingId of callRecordingIds) {
      await client
        .mutation({
          destroyCallRecording: { __args: { id: callRecordingId }, id: true },
        })
        .catch(() => {});
    }

    for (const fixture of borrowedCalendarEventFixtures) {
      try {
        await client.mutation({
          updateCalendarEvent: {
            __args: {
              id: fixture.id,
              data: {
                title: fixture.title,
                startsAt: fixture.startsAt,
                endsAt: fixture.endsAt,
                iCalUid: fixture.iCalUid,
                isCanceled: fixture.isCanceled,
                isFullDay: fixture.isFullDay,
                callRecorderPreference: fixture.callRecorderPreference,
                conferenceLink: fixture.conferenceLink,
              },
            },
            id: true,
          },
        });
      } catch (error) {
        calendarEventRestoreErrors.push(
          error instanceof Error ? error : new Error(String(error)),
        );
      }
    }

    borrowedCalendarEventFixtures.length = 0;
    createdCallRecordingIds.length = 0;

    if (calendarEventRestoreErrors.length > 0) {
      throw new Error(
        `Failed to restore borrowed calendar event fixtures: ${calendarEventRestoreErrors
          .map(({ message }) => message)
          .join('; ')}`,
      );
    }
  };

  const createCalendarEvent = async (
    overrides: Record<string, unknown> = {},
  ): Promise<string> => {
    const fixture =
      availableCalendarEventFixtures[nextCalendarEventFixtureIndex];

    if (fixture === undefined) {
      throw new Error('No visible seeded calendar event fixture available');
    }

    nextCalendarEventFixtureIndex += 1;
    borrowedCalendarEventFixtures.push(fixture);

    await client.mutation({
      updateCalendarEvent: {
        __args: {
          id: fixture.id,
          data: {
            title: 'Customer Sync (call recorder integration test)',
            startsAt: inOneHour(),
            endsAt: inTwoHours(),
            iCalUid: `call-recorder-test-${fixture.id}`,
            isCanceled: false,
            isFullDay: false,
            conferenceLink: {
              primaryLinkUrl: `https://meet.google.com/${fixture.id}`,
            },
            callRecorderPreference: 'ON',
            ...overrides,
          },
        },
        id: true,
      },
    });

    return fixture.id;
  };

  const createPendingCallRecording = async ({
    calendarEventId,
    ...overrides
  }: Record<string, unknown> & {
    calendarEventId: string;
  }): Promise<string> => {
    const callRecordingId = randomUUID();

    await client.mutation({
      createCallRecording: {
        __args: {
          data: {
            id: callRecordingId,
            title: 'Customer Sync (call recorder integration test)',
            status: 'SCHEDULED',
            recordingRequestStatus: 'REQUESTED',
            calendarEventId,
            ...overrides,
          },
        },
        id: true,
      },
    });
    createdCallRecordingIds.push(callRecordingId);

    return callRecordingId;
  };

  const findCallRecordings = async (
    filter: Record<string, unknown>,
  ): Promise<Array<Record<string, any>>> => {
    const result = await client.query({
      callRecordings: {
        __args: { filter, first: 50 },
        edges: {
          node: {
            id: true,
            status: true,
            recordingRequestStatus: true,
            calendarEventId: true,
            externalBotId: true,
            externalRecordingId: true,
            botScheduleAttemptedAt: true,
            botScheduleIdempotencyKey: true,
            callRecorderFailureReason: true,
            startedAt: true,
            endedAt: true,
            transcript: true,
            audio: { fileId: true },
            video: { fileId: true },
          },
        },
      },
    });

    return (result.callRecordings?.edges ?? []).map((edge: any) => edge.node);
  };

  const fetchCallRecorderPreference = async (
    calendarEventId: string,
  ): Promise<string | null> => {
    const result = await client.query({
      calendarEvents: {
        __args: { filter: { id: { eq: calendarEventId } }, first: 1 },
        edges: { node: { id: true, callRecorderPreference: true } },
      },
    });
    const calendarEvent = result.calendarEvents?.edges?.[0]?.node;

    if (calendarEvent === undefined) {
      throw new Error(`Calendar event ${calendarEventId} not found`);
    }

    return calendarEvent.callRecorderPreference ?? null;
  };

  const fetchCallRecording = async (
    callRecordingId: string,
  ): Promise<Record<string, any>> => {
    const callRecording = (
      await findCallRecordings({ id: { eq: callRecordingId } })
    )[0];

    expect(callRecording).toBeDefined();

    return callRecording;
  };

  // Mocked database-event trigger: runs the reconciliation the
  // calendarEvent.* trigger dispatches, then returns the recording it wrote
  // to the DB together with its live Recall bot.
  const scheduleRecordingThroughCalendarReconciliation = async (): Promise<{
    calendarEventId: string;
    callRecordingId: string;
    botId: string;
    metadata: Record<string, string>;
  }> => {
    const calendarEventId = await createCalendarEvent();

    const [reconciliation] = await reconcileCallRecorderForCalendarEventIds({
      client,
      calendarEventIds: [calendarEventId],
    });

    if (reconciliation.action === 'FAILED' || !reconciliation.callRecordingId) {
      throw new Error(
        `Recording fixture failed: ${JSON.stringify(reconciliation)}`,
      );
    }

    const callRecording = await fetchCallRecording(
      reconciliation.callRecordingId,
    );
    expect(callRecording.externalBotId).toBeTruthy();

    return {
      calendarEventId,
      callRecordingId: callRecording.id,
      botId: callRecording.externalBotId,
      metadata: buildBotMetadata(callRecording.id, workspaceId),
    };
  };

  // The recovery cron only reconciles a bot once its meeting has started.
  const moveMeetingIntoPast = (calendarEventId: string) =>
    client.mutation({
      updateCalendarEvent: {
        __args: {
          id: calendarEventId,
          data: { startsAt: daysAgo(9), endsAt: daysAgo(8) },
        },
        id: true,
      },
    });

  const deliverCalendarEventUpdate = ({
    calendarEventId,
    updatedFields,
    before,
    after,
  }: {
    calendarEventId: string;
    updatedFields: string[];
    before: Record<string, unknown>;
    after: Record<string, unknown>;
  }) =>
    (
      reconcileCalendarEventLogicFunction.config.handler as (
        event: unknown,
      ) => Promise<object | undefined>
    )({
      name: 'calendarEvent.updated',
      recordId: calendarEventId,
      properties: {
        updatedFields,
        before: { id: calendarEventId, ...before },
        after: { id: calendarEventId, ...after },
      },
    });

  // Mocked webhook trigger: invokes the webhook logic function handler with
  // the payload Recall would have delivered.
  const deliverRecallWebhook = (body: object) =>
    processRecallWebhookHandler(body);

  // Mocked job queue: runs the artifact imports the webhooks enqueued since
  // the last call, in order.
  let nextArtifactImportRequestIndex = 0;

  const runQueuedArtifactImports = async (): Promise<void> => {
    while (
      nextArtifactImportRequestIndex < recall.artifactImportRequests.length
    ) {
      const artifactImportRequest =
        recall.artifactImportRequests[nextArtifactImportRequestIndex];

      nextArtifactImportRequestIndex += 1;

      await handleCallRecordingArtifactsImportJob(artifactImportRequest);
    }
  };

  // Mocked cron trigger: runs the flows the recovery cron dispatches.
  const runPendingRecoveryCron = () =>
    scheduleRecallBotsForPendingCallRecordings({ client, now: new Date() });
  const runCancellationRetryCron = () =>
    retryFailedRecallCancellations({ client, now: new Date() });
  const runStaleStateCron = async () => {
    const result = await convergeDivergedCallRecordings({
      client,
      now: new Date(),
    });

    while (recall.recoveryRequests.length > 0) {
      await reconcileStaleBotStateHandler(recall.recoveryRequests.shift());
    }

    await runQueuedArtifactImports();
    return result;
  };

  describe('scheduling from calendar changes', () => {
    it('creates a recording and schedules a Recall bot for a meeting with recording enabled', async () => {
      const { callRecordingId, botId } =
        await scheduleRecordingThroughCalendarReconciliation();

      const callRecording = await fetchCallRecording(callRecordingId);

      expect(callRecording.status).toBe('SCHEDULED');
      expect(callRecording.recordingRequestStatus).toBe('REQUESTED');
      expect(callRecording.botScheduleAttemptedAt).toBeTruthy();
      expect(callRecording.botScheduleIdempotencyKey).toBeTruthy();
      expect(recall.bots.get(botId)?.metadata).toEqual(
        buildBotMetadata(callRecordingId, workspaceId),
      );
      expect(recall.creditCheckRequests).toEqual([{ callRecordingId }]);
    });

    it('creates nothing for a meeting without a conference link', async () => {
      const calendarEventId = await createCalendarEvent({
        conferenceLink: { primaryLinkUrl: '' },
      });

      await reconcileCallRecorderForCalendarEventIds({
        client,
        calendarEventIds: [calendarEventId],
      });

      expect(
        await findCallRecordings({
          calendarEventId: { in: [calendarEventId] },
        }),
      ).toEqual([]);
    });
  });

  describe('credit gate', () => {
    it('cancels the scheduled bot before it joins when the workspace cannot spend credits', async () => {
      const { callRecordingId, botId } =
        await scheduleRecordingThroughCalendarReconciliation();
      recall.creditAvailability = {
        hasAvailableCredits: false,
        reason: 'no-credits',
      };

      const result = await handlePreJoinCreditCheckJob(
        recall.creditCheckRequests[0],
      );
      const callRecording = await fetchCallRecording(callRecordingId);

      expect(result).toEqual({
        status: 'blocked',
        failureReason: 'workspace_out_of_credits',
      });
      expect(recall.deletedBotIds).toEqual([botId]);
      expect(callRecording.status).toBe('NOT_RECORDED');
      expect(callRecording.callRecorderFailureReason).toBe(
        'workspace_out_of_credits',
      );
      expect(callRecording.externalBotId).toBeFalsy();
      expect(callRecording.botScheduleIdempotencyKey).toBeFalsy();
    });

    it('leaves the bot alone when the workspace can spend credits', async () => {
      const { callRecordingId, botId } =
        await scheduleRecordingThroughCalendarReconciliation();
      recall.creditAvailability = { hasAvailableCredits: true };

      const result = await handlePreJoinCreditCheckJob(
        recall.creditCheckRequests[0],
      );
      const callRecording = await fetchCallRecording(callRecordingId);

      expect(result).toEqual({ status: 'allowed' });
      expect(recall.deletedBotIds).toEqual([]);
      expect(callRecording.status).toBe('SCHEDULED');
      expect(callRecording.externalBotId).toBe(botId);
    });

    it('runs the queued check through the real worker and leaves a funded bot alone', async ({
      skip,
    }) => {
      const { findManyLogicFunctions } = await new MetadataApiClient().query({
        findManyLogicFunctions: { name: true },
      });

      if (
        !findManyLogicFunctions.some(
          ({ name }) => name === 'check-credits-before-recall-bot-join',
        )
      ) {
        skip('the installed call recorder predates the credit check');
      }

      const { callRecordingId, botId } =
        await scheduleRecordingThroughCalendarReconciliation();

      // The worker runs this job, so the enqueue and the job reads must reach the real server.
      vi.unstubAllGlobals();
      vi.stubEnv('TWENTY_APP_ACCESS_TOKEN', applicationAccessToken);

      const joinAt = new Date(
        Date.now() + PRE_JOIN_CREDIT_CHECK_LEAD_MINUTES * 60 * 1000,
      ).toISOString();
      const jobId = `credit-check.${callRecordingId}.${botId}.${new Date(joinAt).getTime()}`;

      await enqueuePreJoinCreditCheck({
        callRecordingId,
        externalBotId: botId,
        joinAt,
      });

      await expect
        .poll(() => getJobs([jobId]), { timeout: 30_000, interval: 500 })
        .toMatchObject([{ jobId, state: 'COMPLETED' }]);

      const callRecording = await fetchCallRecording(callRecordingId);

      expect(callRecording.status).toBe('SCHEDULED');
      expect(callRecording.externalBotId).toBe(botId);
    });

    it('creates no bot for a meeting about to start when the workspace cannot spend credits', async () => {
      recall.creditAvailability = {
        hasAvailableCredits: false,
        reason: 'no-subscription',
      };
      const calendarEventId = await createCalendarEvent({
        startsAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      });

      const [reconciliation] = await reconcileCallRecorderForCalendarEventIds({
        client,
        calendarEventIds: [calendarEventId],
      });
      const [callRecording] = await findCallRecordings({
        calendarEventId: { in: [calendarEventId] },
      });

      expect(reconciliation.action).toBe('CREATED');
      expect(callRecording.status).toBe('NOT_RECORDED');
      expect(callRecording.callRecorderFailureReason).toBe(
        'workspace_without_subscription',
      );
      expect(callRecording.externalBotId).toBeFalsy();
      expect(recall.bots.size).toBe(0);
      expect(recall.creditCheckRequests).toEqual([]);
    });
  });

  describe('Recall webhook lifecycle', () => {
    it('moves the recording through joining, recording, and processing', async () => {
      const { callRecordingId, botId, metadata } =
        await scheduleRecordingThroughCalendarReconciliation();

      await deliverRecallWebhook(
        buildBotStatusChangeWebhook({
          botId,
          metadata,
          statusCode: 'joining_call',
        }),
      );
      expect((await fetchCallRecording(callRecordingId)).status).toBe(
        'JOINING',
      );

      const recordingStartedAt = new Date().toISOString();

      await deliverRecallWebhook(
        buildBotStatusChangeWebhook({
          botId,
          metadata,
          statusCode: 'in_call_recording',
          statusTimestamp: recordingStartedAt,
        }),
      );
      const recordingCallRecording = await fetchCallRecording(callRecordingId);

      expect(recordingCallRecording.status).toBe('RECORDING');
      expect(recordingCallRecording.startedAt).toBeTruthy();

      const recordingEndedAt = new Date().toISOString();

      await deliverRecallWebhook(
        buildRecordingDoneWebhook({
          botId,
          metadata,
          startedAt: recordingStartedAt,
          completedAt: recordingEndedAt,
        }),
      );
      const processedCallRecording = await fetchCallRecording(callRecordingId);

      expect(processedCallRecording.status).toBe('PROCESSING');
      expect(processedCallRecording.externalRecordingId).toBe(
        'recall-recording-1',
      );
      expect(processedCallRecording.endedAt).toBeTruthy();
      expect(recall.artifactImportRequests).toHaveLength(3);
    });

    it('queues another artifact import when the transcript finishes later', async () => {
      const { callRecordingId, botId, metadata } =
        await scheduleRecordingThroughCalendarReconciliation();

      await deliverRecallWebhook(
        buildRecordingDoneWebhook({
          botId,
          metadata,
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
        }),
      );
      await deliverRecallWebhook(
        buildTranscriptDoneWebhook({ botId, metadata }),
      );

      expect(recall.artifactImportRequests).toHaveLength(4);
      expect(recall.artifactImportRequests[3]).toMatchObject({
        callRecordingId,
      });
    });

    it('completes a recording whose transcript came back empty', async () => {
      const { callRecordingId, botId, metadata } =
        await scheduleRecordingThroughCalendarReconciliation();

      await deliverRecallWebhook(
        buildRecordingDoneWebhook({
          botId,
          metadata,
          startedAt: hoursAgo(1),
          completedAt: new Date().toISOString(),
        }),
      );
      await runQueuedArtifactImports();

      expect((await fetchCallRecording(callRecordingId)).status).toBe(
        'PROCESSING',
      );

      recall.completeTranscripts([]);

      await deliverRecallWebhook(
        buildTranscriptDoneWebhook({ botId, metadata }),
      );
      await runQueuedArtifactImports();

      const callRecording = await fetchCallRecording(callRecordingId);

      expect(callRecording.status).toBe('COMPLETED');
      expect(callRecording.transcript).toEqual({
        recallTranscriptId: 'recall-transcript-1',
        status: 'EMPTY',
      });
    });

    it('completes a recording without a transcript when Recall rejects the transcript request', async () => {
      const { callRecordingId, botId, metadata } =
        await scheduleRecordingThroughCalendarReconciliation();

      recall.transcriptRequestFailureStatus = 400;

      await deliverRecallWebhook(
        buildRecordingDoneWebhook({
          botId,
          metadata,
          startedAt: hoursAgo(1),
          completedAt: new Date().toISOString(),
        }),
      );
      await runQueuedArtifactImports();

      const callRecording = await fetchCallRecording(callRecordingId);

      expect(callRecording.status).toBe('COMPLETED');
      expect(callRecording.transcript).toEqual({
        recallTranscriptId: null,
        status: 'EMPTY',
        subCode: 'transcript_request_rejected:400',
      });
    });

    it('keeps a recording processing when the Recall account rejects the transcript request', async () => {
      const { callRecordingId, botId, metadata } =
        await scheduleRecordingThroughCalendarReconciliation();

      recall.transcriptRequestFailureStatus = 402;

      await deliverRecallWebhook(
        buildRecordingDoneWebhook({
          botId,
          metadata,
          startedAt: hoursAgo(1),
          completedAt: new Date().toISOString(),
        }),
      );
      await runQueuedArtifactImports();

      const callRecording = await fetchCallRecording(callRecordingId);

      expect(callRecording.status).toBe('PROCESSING');
      expect(callRecording.transcript).toBeNull();
    });

    it('keeps a recording processing while the transcript request fails temporarily', async () => {
      const { callRecordingId, botId, metadata } =
        await scheduleRecordingThroughCalendarReconciliation();

      recall.transcriptRequestFailureStatus = 503;

      await deliverRecallWebhook(
        buildRecordingDoneWebhook({
          botId,
          metadata,
          startedAt: hoursAgo(1),
          completedAt: new Date().toISOString(),
        }),
      );

      await expect(runQueuedArtifactImports()).rejects.toMatchObject({
        name: 'RetryableLogicFunctionError',
      });

      const callRecording = await fetchCallRecording(callRecordingId);

      expect(callRecording.status).toBe('PROCESSING');
      expect(callRecording.transcript).toBeNull();
    });

    it('never moves the status backwards on late webhook deliveries', async () => {
      const { callRecordingId, botId, metadata } =
        await scheduleRecordingThroughCalendarReconciliation();

      await deliverRecallWebhook(
        buildRecordingDoneWebhook({
          botId,
          metadata,
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
        }),
      );

      const lateJoiningResult = await deliverRecallWebhook(
        buildBotStatusChangeWebhook({
          botId,
          metadata,
          statusCode: 'joining_call',
        }),
      );

      expect(lateJoiningResult.status).toBe('skipped');
      expect((await fetchCallRecording(callRecordingId)).status).toBe(
        'PROCESSING',
      );
    });

    it('marks the recording failed when the bot dies fatally', async () => {
      const { callRecordingId, botId, metadata } =
        await scheduleRecordingThroughCalendarReconciliation();

      await deliverRecallWebhook(
        buildBotStatusChangeWebhook({ botId, metadata, statusCode: 'fatal' }),
      );

      const callRecording = await fetchCallRecording(callRecordingId);

      expect(callRecording.status).toBe('FAILED');
      expect(callRecording.callRecorderFailureReason).toBe('fatal');
    });

    it('marks the recording NOT_RECORDED when nobody joined the meeting', async () => {
      const { callRecordingId, botId, metadata } =
        await scheduleRecordingThroughCalendarReconciliation();

      await deliverRecallWebhook(
        buildBotStatusChangeWebhook({
          botId,
          metadata,
          statusCode: 'call_ended',
          statusSubCode: 'timeout_exceeded_noone_joined',
        }),
      );

      const callRecording = await fetchCallRecording(callRecordingId);

      expect(callRecording.status).toBe('NOT_RECORDED');
      expect(callRecording.callRecorderFailureReason).toBe(
        'timeout_exceeded_noone_joined',
      );

      const lateDoneResult = await deliverRecallWebhook(
        buildBotStatusChangeWebhook({
          botId,
          metadata,
          statusCode: 'done',
        }),
      );

      expect(lateDoneResult.status).toBe('skipped');
      expect((await fetchCallRecording(callRecordingId)).status).toBe(
        'NOT_RECORDED',
      );
    });

    it('ignores webhooks that match no known recording', async () => {
      const { callRecordingId } =
        await scheduleRecordingThroughCalendarReconciliation();

      const result = await deliverRecallWebhook(
        buildBotStatusChangeWebhook({
          botId: 'recall-bot-from-another-app',
          metadata: buildBotMetadata(randomUUID(), workspaceId),
          statusCode: 'joining_call',
        }),
      );

      expect(result.status).toBe('skipped');
      expect((await fetchCallRecording(callRecordingId)).status).toBe(
        'SCHEDULED',
      );
    });
  });

  describe('cancellation', () => {
    it('cancels the request and deletes the Recall bot', async () => {
      const { callRecordingId, botId } =
        await scheduleRecordingThroughCalendarReconciliation();

      await cancelCallRecordingRequest({
        client,
        callRecording: { id: callRecordingId, externalBotId: botId },
      });

      const callRecording = await fetchCallRecording(callRecordingId);

      expect(callRecording.recordingRequestStatus).toBe('CANCELED');
      // The API stores a cleared TEXT field as an empty string.
      expect(callRecording.externalBotId).toBeFalsy();
      expect(recall.deletedBotIds).toEqual([botId]);
    });

    it('retries a failed Recall cancellation on the next cron run', async () => {
      const { callRecordingId, botId } =
        await scheduleRecordingThroughCalendarReconciliation();

      recall.failNextDelete = true;
      await cancelCallRecordingRequest({
        client,
        callRecording: { id: callRecordingId, externalBotId: botId },
      });

      // The Recall half failed, so the bot id must survive for the retry.
      expect((await fetchCallRecording(callRecordingId)).externalBotId).toBe(
        botId,
      );

      await runCancellationRetryCron();

      expect(
        (await fetchCallRecording(callRecordingId)).externalBotId,
      ).toBeFalsy();
      expect(recall.deletedBotIds).toContain(botId);
    });
  });

  describe('artifact import queue', () => {
    beforeEach(() => {
      vi.unstubAllGlobals();
      vi.stubEnv('TWENTY_APP_ACCESS_TOKEN', applicationAccessToken);
    });

    const waitForCompletedJob = async (jobId: string) => {
      await expect
        .poll(() => getJobs([jobId]), { timeout: 30_000, interval: 500 })
        .toMatchObject([{ jobId, state: 'COMPLETED' }]);

      return getJobs([jobId]);
    };

    it.each([
      { scope: 'transcript', trigger: 'transcript-ready', suffix: 'ready' },
      { scope: 'video', trigger: 'recovery', suffix: 'recovery-2026-06-10' },
      { scope: 'audio', trigger: 'expired', suffix: 'expired' },
    ] as const)(
      'deduplicates $scope imports and allows a later $trigger job',
      async ({ scope, trigger, suffix }) => {
        // A missing recording lets the real worker finish without contacting Recall.
        const callRecordingId = randomUUID();
        const request = {
          callRecordingIds: [callRecordingId],
          scopes: [scope],
          requestedAt: '2026-06-10T03:30:00.000Z',
        };
        const jobId = `call-recorder-${callRecordingId}-${scope}`;

        await enqueueCallRecordingArtifactsImport(request);
        const originalJob = await waitForCompletedJob(jobId);
        await enqueueCallRecordingArtifactsImport(request);
        expect(await getJobs([jobId])).toEqual(originalJob);

        await enqueueCallRecordingArtifactsImport({ ...request, trigger });
        const laterJobId = `${jobId}-${suffix}`;
        const laterJob = await waitForCompletedJob(laterJobId);
        await enqueueCallRecordingArtifactsImport({ ...request, trigger });
        expect(await getJobs([laterJobId])).toEqual(laterJob);
      },
    );

    it.each([
      { scope: 'video', attemptsMade: 1 },
      { scope: 'audio', attemptsMade: 3 },
    ] as const)(
      'stops failed $scope executions after $attemptsMade attempts',
      async ({ scope, attemptsMade }) => {
        // Invalid UUID input makes the real database read fail before any Recall request.
        const callRecordingId = `invalid-${randomUUID()}`;
        const jobId = `call-recorder-${callRecordingId}-${scope}`;

        await enqueueCallRecordingArtifactsImport({
          callRecordingIds: [callRecordingId],
          scopes: [scope],
        });

        // The worker completes the job when the application's retry budget is exhausted.
        await expect
          .poll(() => getJobs([jobId]), { timeout: 30_000, interval: 500 })
          .toMatchObject([{ jobId, state: 'COMPLETED', attemptsMade }]);
      },
    );
  });

  describe('settling recordings whose Recall media expired', () => {
    const recordingStartedAt = () => hoursAgo(1);

    const deliverRecordingDone = async ({
      botId,
      metadata,
    }: {
      botId: string;
      metadata: Record<string, string>;
    }): Promise<{ startedAt: string; completedAt: string }> => {
      const startedAt = recordingStartedAt();
      const completedAt = new Date().toISOString();

      await deliverRecallWebhook(
        buildRecordingDoneWebhook({ botId, metadata, startedAt, completedAt }),
      );

      return { startedAt, completedAt };
    };

    const expireMediaAndAgeMeeting = async ({
      calendarEventId,
      botId,
      startedAt,
      completedAt,
    }: {
      calendarEventId: string;
      botId: string;
      startedAt: string;
      completedAt: string;
    }) => {
      recall.expireBotMedia({
        botId,
        recordingStartedAt: startedAt,
        recordingEndedAt: completedAt,
      });
      await moveMeetingIntoPast(calendarEventId);
    };

    const expectFailedWithExpiredArtifacts = (
      callRecording: Awaited<ReturnType<typeof fetchCallRecording>>,
    ) => {
      expect(callRecording.status).toBe('FAILED');
      expect(callRecording.callRecorderFailureReason.split(',').sort()).toEqual(
        ['audio_import_expired', 'video_import_expired'],
      );
      expect(callRecording.transcript).toEqual({
        recallTranscriptId: null,
        status: 'EMPTY',
        subCode: 'transcript_expired',
      });
    };

    it('preserves independent failure outcomes when audio and video save concurrently', async () => {
      const { callRecordingId, botId, metadata } =
        await scheduleRecordingThroughCalendarReconciliation();
      await deliverRecordingDone({ botId, metadata });

      await Promise.all(
        ['audio_file_too_large', 'video_import_failed'].map(
          (callRecorderFailureReason) =>
            saveCallRecordingImportProgress(client, {
              callRecordingId,
              externalBotId: botId,
              data: { callRecorderFailureReason },
            }),
        ),
      );

      await saveCallRecordingImportProgress(client, {
        callRecordingId,
        externalBotId: botId,
        data: { video: [{ fileId: randomUUID(), label: 'late-video.mp4' }] },
      });

      expect(
        (await fetchCallRecording(callRecordingId)).callRecorderFailureReason
          .split(',')
          .sort(),
      ).toEqual(['audio_file_too_large', 'video_import_failed']);
      expect((await fetchCallRecording(callRecordingId)).video ?? []).toEqual(
        [],
      );
    });

    it('replaces a pending transcript and ignores late pending or failed results', async () => {
      const { callRecordingId, botId, metadata } =
        await scheduleRecordingThroughCalendarReconciliation();
      await deliverRecordingDone({ botId, metadata });
      const pending = { status: 'PENDING', recallTranscriptId: 'transcript-1' };
      const transcript = { utterances: [{ text: 'Ready transcript' }] };
      for (const data of [
        { transcript: pending },
        { transcript },
        { transcript: pending },
        {
          transcript: { status: 'FAILED' },
          callRecorderFailureReason: 'transcript_failed',
        },
      ]) {
        await saveCallRecordingImportProgress(client, {
          callRecordingId,
          externalBotId: botId,
          data,
        });
      }

      const callRecording = await fetchCallRecording(callRecordingId);
      expect(callRecording.transcript).toEqual(transcript);
      expect(callRecording.callRecorderFailureReason).toBeFalsy();
    });

    it.each([
      { status: 'COMPLETED' },
      { externalBotId: 'replacement-bot' },
    ] as const)(
      'ignores late import progress after the recording changes: %j',
      async (data) => {
        const { callRecordingId, botId, metadata } =
          await scheduleRecordingThroughCalendarReconciliation();
        await deliverRecordingDone({ botId, metadata });
        await client.mutation({
          updateCallRecording: {
            __args: { id: callRecordingId, data },
            id: true,
          },
        });

        await saveCallRecordingImportProgress(client, {
          callRecordingId,
          externalBotId: botId,
          data: { transcript: { status: 'FAILED' } },
        });

        expect(
          (await fetchCallRecording(callRecordingId)).transcript,
        ).toBeNull();
      },
    );

    it('fails a processing recording whose media expired before any artifact was imported', async () => {
      const { calendarEventId, callRecordingId, botId, metadata } =
        await scheduleRecordingThroughCalendarReconciliation();
      const { startedAt, completedAt } = await deliverRecordingDone({
        botId,
        metadata,
      });

      await expireMediaAndAgeMeeting({
        calendarEventId,
        botId,
        startedAt,
        completedAt,
      });

      const cronResult = await runStaleStateCron();

      expect(cronResult.enqueuedCallRecordingIds).toEqual([callRecordingId]);

      const callRecording = await fetchCallRecording(callRecordingId);

      expectFailedWithExpiredArtifacts(callRecording);
    });

    it.each(
      (['audio', 'video'] as const).flatMap((scope) =>
        (['recovery', 'expired'] as const).flatMap((trigger) =>
          ['', '-expired', '-recovery-2026-06-10', '-recovery-2026-06-09'].map(
            (suffix) => ({ scope, trigger, suffix }),
          ),
        ),
      ),
    )(
      'leaves the active $scope$suffix import to the queue on $trigger while settling the other expired artifacts',
      async ({ scope, trigger, suffix }) => {
        const { calendarEventId, callRecordingId, botId, metadata } =
          await scheduleRecordingThroughCalendarReconciliation();
        const { startedAt, completedAt } = await deliverRecordingDone({
          botId,
          metadata,
        });

        await expireMediaAndAgeMeeting({
          calendarEventId,
          botId,
          startedAt,
          completedAt,
        });
        recall.artifactImportRequests = [];
        recall.activeArtifactJobIds.add(
          `call-recorder-${callRecordingId}-${scope}${suffix}`,
        );

        await enqueueCallRecordingArtifactsImport({
          callRecordingIds: [callRecordingId],
          scopes: ['transcript', 'audio', 'video'],
          trigger,
          requestedAt: '2026-06-10T00:05:00.000Z',
        });
        await runQueuedArtifactImports();

        const callRecording = await fetchCallRecording(callRecordingId);

        expect(callRecording.status).toBe('PROCESSING');
        expect(callRecording.callRecorderFailureReason).toBe(
          `${scope === 'audio' ? 'video' : 'audio'}_import_expired`,
        );
        expect(callRecording.transcript).toMatchObject({ status: 'EMPTY' });
      },
    );

    it('completes a processing recording with imported media once Recall expires the rest', async () => {
      const { calendarEventId, callRecordingId, botId, metadata } =
        await scheduleRecordingThroughCalendarReconciliation();
      const { startedAt, completedAt } = await deliverRecordingDone({
        botId,
        metadata,
      });

      await runQueuedArtifactImports();
      const imported = await fetchCallRecording(callRecordingId);
      await saveCallRecordingImportProgress(client, {
        callRecordingId,
        externalBotId: botId,
        data: {
          video: [{ fileId: randomUUID(), label: 'late-video.mp4' }],
          callRecorderFailureReason: 'video_import_failed',
        },
      });
      await expireMediaAndAgeMeeting({
        calendarEventId,
        botId,
        startedAt,
        completedAt,
      });

      const cronResult = await runStaleStateCron();

      expect(cronResult.enqueuedCallRecordingIds).toEqual([callRecordingId]);

      const callRecording = await fetchCallRecording(callRecordingId);

      expect(callRecording.status).toBe('COMPLETED');
      expect(callRecording.video).toMatchObject([
        { fileId: imported.video[0].fileId },
      ]);
      expect(callRecording.callRecorderFailureReason).toBeFalsy();
      expect(callRecording.transcript).toEqual({
        recallTranscriptId: 'recall-transcript-1',
        status: 'EMPTY',
        subCode: 'transcript_expired',
      });
    });

    it('keeps audio and never retries a saved video failure, including during repair', async () => {
      const { calendarEventId, callRecordingId, botId, metadata } =
        await scheduleRecordingThroughCalendarReconciliation();

      recall.failVideoDownload = true;

      const { startedAt, completedAt } = await deliverRecordingDone({
        botId,
        metadata,
      });

      await runQueuedArtifactImports();
      recall.failVideoDownload = false;
      await runStaleStateCron();

      const repaired = await fetchCallRecording(callRecordingId);
      expect(repaired.audio).toHaveLength(1);
      expect(repaired.video ?? []).toHaveLength(0);
      expect(repaired.callRecorderFailureReason).toBe('video_import_failed');

      await expireMediaAndAgeMeeting({
        calendarEventId,
        botId,
        startedAt,
        completedAt,
      });

      await runStaleStateCron();

      const callRecording = await fetchCallRecording(callRecordingId);

      expect(callRecording.status).toBe('COMPLETED');
      expect(callRecording.callRecorderFailureReason).toBe(
        'video_import_failed',
      );
      expect(callRecording.transcript).toMatchObject({ status: 'EMPTY' });
    });

    it('saves and settles a video timeout even after its work signal has aborted', async () => {
      const { callRecordingId, botId, metadata } =
        await scheduleRecordingThroughCalendarReconciliation();
      await deliverRecordingDone({ botId, metadata });
      await saveCallRecordingImportProgress(client, {
        callRecordingId,
        externalBotId: botId,
        data: { transcript: { status: 'EMPTY', recallTranscriptId: null } },
      });

      const controller = new AbortController();
      const originalTimeout = AbortSignal.timeout.bind(AbortSignal);
      const timeout = vi
        .spyOn(AbortSignal, 'timeout')
        .mockImplementation((milliseconds) =>
          milliseconds === 14 * 60 * 1000
            ? controller.signal
            : originalTimeout(milliseconds),
        );
      const originalFetch = globalThis.fetch;
      vi.stubGlobal(
        'fetch',
        (input: Parameters<typeof fetch>[0], init?: RequestInit) => {
          if (String(input).endsWith('/media/video.mp4')) {
            controller.abort(
              new DOMException('Video deadline elapsed', 'TimeoutError'),
            );
            return Promise.reject(controller.signal.reason);
          }

          return originalFetch(input, init);
        },
      );

      try {
        await runQueuedArtifactImports();
      } finally {
        timeout.mockRestore();
      }

      const callRecording = await fetchCallRecording(callRecordingId);
      expect(callRecording.status).toBe('COMPLETED');
      expect(callRecording.audio).toHaveLength(1);
      expect(callRecording.callRecorderFailureReason).toBe(
        'video_import_failed',
      );
    });

    it('fails a recording whose media was too large to store and whose transcript never arrived', async () => {
      const { calendarEventId, callRecordingId, botId, metadata } =
        await scheduleRecordingThroughCalendarReconciliation();

      recall.mediaContentLengthBytes = 600 * 1024 * 1024;

      const { startedAt, completedAt } = await deliverRecordingDone({
        botId,
        metadata,
      });

      await runQueuedArtifactImports();

      expect(
        (await fetchCallRecording(callRecordingId)).callRecorderFailureReason,
      ).toBe('audio_file_too_large,video_file_too_large');

      await expireMediaAndAgeMeeting({
        calendarEventId,
        botId,
        startedAt,
        completedAt,
      });

      await runStaleStateCron();

      const callRecording = await fetchCallRecording(callRecordingId);

      expect(callRecording.status).toBe('FAILED');
      expect(callRecording.callRecorderFailureReason).toBe(
        'audio_file_too_large,video_file_too_large',
      );
      expect(callRecording.transcript).toMatchObject({ status: 'EMPTY' });
    });

    it('settles a processing recording when Recall reports its media expired by webhook', async () => {
      const { callRecordingId, botId, metadata } =
        await scheduleRecordingThroughCalendarReconciliation();

      const { startedAt, completedAt } = await deliverRecordingDone({
        botId,
        metadata,
      });
      recall.expireBotMedia({
        botId,
        recordingStartedAt: startedAt,
        recordingEndedAt: completedAt,
      });
      await deliverRecallWebhook(
        buildBotStatusChangeWebhook({
          botId,
          metadata,
          statusCode: 'media_expired',
        }),
      );

      expect(recall.artifactImportRequests).toHaveLength(6);

      await runQueuedArtifactImports();

      const callRecording = await fetchCallRecording(callRecordingId);

      expectFailedWithExpiredArtifacts(callRecording);
    });

    it('settles a processing recording when Recall announces retention expiry by recording.deleted', async () => {
      const { callRecordingId, botId, metadata } =
        await scheduleRecordingThroughCalendarReconciliation();

      const { startedAt, completedAt } = await deliverRecordingDone({
        botId,
        metadata,
      });
      recall.expireBotMedia({
        botId,
        recordingStartedAt: startedAt,
        recordingEndedAt: completedAt,
      });
      await deliverRecallWebhook(
        buildRecordingDeletedWebhook({ botId, metadata }),
      );

      expect(recall.artifactImportRequests).toHaveLength(6);

      await runQueuedArtifactImports();

      const callRecording = await fetchCallRecording(callRecordingId);

      expectFailedWithExpiredArtifacts(callRecording);
    });

    it('drops a recording.deleted webhook for a recording that already completed', async () => {
      const { callRecordingId, botId, metadata } =
        await scheduleRecordingThroughCalendarReconciliation();

      await deliverRecordingDone({ botId, metadata });
      await runQueuedArtifactImports();
      recall.completeTranscripts([]);
      await deliverRecallWebhook(
        buildTranscriptDoneWebhook({ botId, metadata }),
      );
      await runQueuedArtifactImports();

      expect((await fetchCallRecording(callRecordingId)).status).toBe(
        'COMPLETED',
      );

      const importRequestCountBeforeDeletion =
        recall.artifactImportRequests.length;

      await deliverRecallWebhook(
        buildRecordingDeletedWebhook({ botId, metadata }),
      );

      expect(recall.artifactImportRequests).toHaveLength(
        importRequestCountBeforeDeletion,
      );

      const callRecording = await fetchCallRecording(callRecordingId);

      expect(callRecording.status).toBe('COMPLETED');
      expect(callRecording.callRecorderFailureReason).toBeFalsy();
      expect(callRecording.audio).toHaveLength(1);
      expect(callRecording.video).toHaveLength(1);
    });

    it('fails a processing recording whose recording.done was lost once the bot reports its media expired', async () => {
      const { callRecordingId, botId, metadata } =
        await scheduleRecordingThroughCalendarReconciliation();
      const startedAt = recordingStartedAt();
      const endedAt = new Date().toISOString();

      await deliverRecallWebhook(
        buildBotStatusChangeWebhook({
          botId,
          metadata,
          statusCode: 'call_ended',
          statusTimestamp: endedAt,
        }),
      );

      const processingCallRecording = await fetchCallRecording(callRecordingId);

      expect(processingCallRecording.status).toBe('PROCESSING');
      expect(processingCallRecording.externalRecordingId).toBeFalsy();
      expect(processingCallRecording.startedAt).toBeFalsy();

      recall.expireBotMedia({
        botId,
        recordingStartedAt: startedAt,
        recordingEndedAt: endedAt,
      });

      await runStaleStateCron();

      const callRecording = await fetchCallRecording(callRecordingId);

      expectFailedWithExpiredArtifacts(callRecording);
      expect(callRecording.startedAt).toBeTruthy();
    });

    it('keeps converging a processing recording whose media is still available', async () => {
      const { calendarEventId, callRecordingId, botId, metadata } =
        await scheduleRecordingThroughCalendarReconciliation();

      await deliverRecordingDone({ botId, metadata });
      await client.mutation({
        updateCalendarEvent: {
          __args: {
            id: calendarEventId,
            data: { startsAt: daysAgo(2), endsAt: daysAgo(1) },
          },
          id: true,
        },
      });

      await runStaleStateCron();

      const callRecording = await fetchCallRecording(callRecordingId);

      expect(callRecording.status).toBe('PROCESSING');
      expect(callRecording.callRecorderFailureReason).toBeFalsy();
    });
  });

  describe('recovering recordings whose Recall webhooks were lost', () => {
    it('imports the media of a processing recording whose recording.done was lost', async () => {
      const { callRecordingId, botId, metadata } =
        await scheduleRecordingThroughCalendarReconciliation();
      const startedAt = hoursAgo(1);
      const endedAt = new Date().toISOString();

      await deliverRecallWebhook(
        buildBotStatusChangeWebhook({
          botId,
          metadata,
          statusCode: 'call_ended',
          statusTimestamp: endedAt,
        }),
      );
      recall.finishBotRecording({
        botId,
        recordingStartedAt: startedAt,
        recordingEndedAt: endedAt,
      });

      const cronResult = await runStaleStateCron();

      expect(cronResult.enqueuedCallRecordingIds).toEqual([callRecordingId]);

      const callRecording = await fetchCallRecording(callRecordingId);

      expect(callRecording.status).toBe('PROCESSING');
      expect(callRecording.externalRecordingId).toBe('recall-recording-1');
      expect(callRecording.startedAt).toBeTruthy();
      expect(callRecording.audio).toHaveLength(1);
      expect(callRecording.video).toHaveLength(1);
      expect(callRecording.transcript).toMatchObject({ status: 'PENDING' });
    });

    it('moves a recording still marked recording to processing once Recall shows the bot finished', async () => {
      const { calendarEventId, callRecordingId, botId, metadata } =
        await scheduleRecordingThroughCalendarReconciliation();
      const startedAt = hoursAgo(1);
      const endedAt = new Date().toISOString();

      await deliverRecallWebhook(
        buildBotStatusChangeWebhook({
          botId,
          metadata,
          statusCode: 'in_call_recording',
          statusTimestamp: startedAt,
        }),
      );
      recall.finishBotRecording({
        botId,
        recordingStartedAt: startedAt,
        recordingEndedAt: endedAt,
      });
      await moveMeetingIntoPast(calendarEventId);

      const cronResult = await runStaleStateCron();

      expect(cronResult.enqueuedCallRecordingIds).toEqual([callRecordingId]);

      const callRecording = await fetchCallRecording(callRecordingId);

      expect(callRecording.status).toBe('PROCESSING');
      expect(callRecording.externalRecordingId).toBe('recall-recording-1');
      expect(callRecording.endedAt).toBeTruthy();
      expect(callRecording.audio).toHaveLength(1);
      expect(callRecording.video).toHaveLength(1);
    });

    it('fails a recording still marked recording whose bot vanished from Recall', async () => {
      const { calendarEventId, callRecordingId, botId, metadata } =
        await scheduleRecordingThroughCalendarReconciliation();

      await deliverRecallWebhook(
        buildBotStatusChangeWebhook({
          botId,
          metadata,
          statusCode: 'in_call_recording',
        }),
      );
      recall.bots.delete(botId);
      await moveMeetingIntoPast(calendarEventId);

      await runStaleStateCron();

      const callRecording = await fetchCallRecording(callRecordingId);

      expect(callRecording.status).toBe('FAILED');
      expect(callRecording.callRecorderFailureReason).toBe(
        'recall_bot_not_found',
      );
    });

    it('leaves an upcoming meeting alone', async () => {
      const { callRecordingId, botId, metadata } =
        await scheduleRecordingThroughCalendarReconciliation();

      await deliverRecallWebhook(
        buildBotStatusChangeWebhook({
          botId,
          metadata,
          statusCode: 'joining_call',
        }),
      );
      recall.bots.delete(botId);

      const cronResult = await runStaleStateCron();

      expect(cronResult.enqueuedCallRecordingIds).toEqual([]);
      expect((await fetchCallRecording(callRecordingId)).status).toBe(
        'JOINING',
      );
    });
  });

  describe('crash recovery cron', () => {
    it('schedules a bot for a recording created without one, with zero Recall list reads', async () => {
      const calendarEventId = await createCalendarEvent();
      const callRecordingId = await createPendingCallRecording({
        calendarEventId,
      });

      await runPendingRecoveryCron();

      const callRecording = await fetchCallRecording(callRecordingId);

      expect(callRecording.externalBotId).toBeTruthy();
      expect(recall.botForCallRecording(callRecordingId)?.id).toBe(
        callRecording.externalBotId,
      );
      expect(recall.listRequestCount).toBe(0);
    });

    it('re-sends the creation after a lost write-back and lands on the same bot', async () => {
      const calendarEventId = await createCalendarEvent();
      const callRecordingId = await createPendingCallRecording({
        calendarEventId,
      });

      // First recovery run creates the bot and records the attempt.
      await runPendingRecoveryCron();
      const firstBotId = (await fetchCallRecording(callRecordingId))
        .externalBotId;

      // Simulate the id write-back getting lost after the POST reached
      // Recall.
      await client.mutation({
        updateCallRecording: {
          __args: { id: callRecordingId, data: { externalBotId: null } },
          id: true,
        },
      });

      await runPendingRecoveryCron();

      // Recall dedupes the repeated idempotency key: the very same bot is
      // written back, without any list request.
      expect((await fetchCallRecording(callRecordingId)).externalBotId).toBe(
        firstBotId,
      );
      expect(recall.listRequestCount).toBe(0);
    });

    it('attaches an existing bot found by lookup when the recorded attempt drifted', async () => {
      const calendarEventId = await createCalendarEvent();
      const callRecordingId = await createPendingCallRecording({
        calendarEventId,
        botScheduleAttemptedAt: hoursAgo(1),
        botScheduleIdempotencyKey: 'key-from-before-the-meeting-moved',
      });

      recall.seedBot({
        id: 'recall-bot-from-crashed-run',
        metadata: buildBotMetadata(callRecordingId, workspaceId),
        statusCode: 'ready',
      });

      await runPendingRecoveryCron();

      expect((await fetchCallRecording(callRecordingId)).externalBotId).toBe(
        'recall-bot-from-crashed-run',
      );
      expect(recall.listRequestCount).toBe(1);
    });

    it('fails a recording whose meeting ended before any bot creation was attempted', async () => {
      const calendarEventId = await createCalendarEvent({
        startsAt: hoursAgo(3),
        endsAt: hoursAgo(2),
      });
      const callRecordingId = await createPendingCallRecording({
        calendarEventId,
      });

      await runPendingRecoveryCron();

      const callRecording = await fetchCallRecording(callRecordingId);

      expect(callRecording.status).toBe('FAILED');
      expect(callRecording.callRecorderFailureReason).toBe(
        'bot_never_scheduled',
      );
      expect(recall.botForCallRecording(callRecordingId)).toBeUndefined();
    });
  });

  describe('Recording Bot preference', () => {
    it('marks a blank preference On when it schedules a bot', async () => {
      const calendarEventId = await createCalendarEvent({
        callRecorderPreference: null,
      });

      await reconcileCallRecorderForCalendarEventIds({
        client,
        calendarEventIds: [calendarEventId],
      });

      expect(await fetchCallRecorderPreference(calendarEventId)).toBe('ON');

      const callRecording = (
        await findCallRecordings({ calendarEventId: { in: [calendarEventId] } })
      )[0];

      expect(callRecording).toBeDefined();
      expect(callRecording.externalBotId).toBeTruthy();
    });

    it('leaves a blank preference blank on a meeting that already ended', async () => {
      const calendarEventId = await createCalendarEvent({
        startsAt: hoursAgo(3),
        endsAt: hoursAgo(2),
        callRecorderPreference: null,
      });

      await reconcileCallRecorderForCalendarEventIds({
        client,
        calendarEventIds: [calendarEventId],
      });

      expect(await fetchCallRecorderPreference(calendarEventId)).toBeNull();
      expect(
        await findCallRecordings({
          calendarEventId: { in: [calendarEventId] },
        }),
      ).toEqual([]);
    });

    it('leaves an explicit Off alone and schedules nothing', async () => {
      const calendarEventId = await createCalendarEvent({
        callRecorderPreference: 'OFF',
      });

      await reconcileCallRecorderForCalendarEventIds({
        client,
        calendarEventIds: [calendarEventId],
      });

      expect(await fetchCallRecorderPreference(calendarEventId)).toBe('OFF');
      expect(
        await findCallRecordings({
          calendarEventId: { in: [calendarEventId] },
        }),
      ).toEqual([]);
    });

    it('marks every blank copy of the same meeting On, past the update batch size in one go', async () => {
      const requiredCalendarEventFixtureCount =
        CALENDAR_EVENT_UPDATE_BATCH_SIZE + 1;
      const availableCalendarEventFixtureCount =
        availableCalendarEventFixtures.length - nextCalendarEventFixtureIndex;

      if (
        availableCalendarEventFixtureCount < requiredCalendarEventFixtureCount
      ) {
        throw new Error(
          `Batch boundary test requires ${requiredCalendarEventFixtureCount} fully visible seeded calendar events, but only ${availableCalendarEventFixtureCount} remain`,
        );
      }

      const startsAt = inOneHour();
      const endsAt = inTwoHours();
      const conferenceLink = {
        primaryLinkUrl: `https://meet.google.com/${randomUUID()}`,
      };
      const calendarEventIds: string[] = [];

      for (
        let copyIndex = 0;
        copyIndex < requiredCalendarEventFixtureCount;
        copyIndex += 1
      ) {
        calendarEventIds.push(
          await createCalendarEvent({
            startsAt,
            endsAt,
            conferenceLink,
            callRecorderPreference: null,
          }),
        );
      }

      await reconcileCallRecorderForCalendarEventIds({
        client,
        calendarEventIds: [calendarEventIds[0]],
      });

      const preferences = await Promise.all(
        calendarEventIds.map((calendarEventId) =>
          fetchCallRecorderPreference(calendarEventId),
        ),
      );

      expect(preferences.every((preference) => preference === 'ON')).toBe(true);
      expect(
        await findCallRecordings({ calendarEventId: { in: calendarEventIds } }),
      ).toHaveLength(1);
    });

    it('marks a blank preference On again when it updates an existing scheduled recording', async () => {
      const { calendarEventId } =
        await scheduleRecordingThroughCalendarReconciliation();

      await client.mutation({
        updateCalendarEvent: {
          __args: {
            id: calendarEventId,
            data: { callRecorderPreference: null },
          },
          id: true,
        },
      });
      await reconcileCallRecorderForCalendarEventIds({
        client,
        calendarEventIds: [calendarEventId],
      });

      expect(await fetchCallRecorderPreference(calendarEventId)).toBe('ON');
      expect(
        await findCallRecordings({
          calendarEventId: { in: [calendarEventId] },
        }),
      ).toHaveLength(1);
    });

    it('still schedules the bot when the On write is rejected', async () => {
      const calendarEventId = await createCalendarEvent({
        callRecorderPreference: null,
      });

      recall.failCalendarEventUpdates = true;

      const results = await reconcileCallRecorderForCalendarEventIds({
        client: new CoreApiClient(),
        calendarEventIds: [calendarEventId],
      });

      expect(results).toEqual([expect.objectContaining({ action: 'CREATED' })]);
      expect(await fetchCallRecorderPreference(calendarEventId)).toBeNull();

      const callRecording = (
        await findCallRecordings({ calendarEventId: { in: [calendarEventId] } })
      )[0];

      expect(callRecording).toBeDefined();
      expect(callRecording.externalBotId).toBeTruthy();
    });

    it('does not reconcile again on the echo of its own On write', async () => {
      const calendarEventId = await createCalendarEvent({
        callRecorderPreference: null,
      });

      await reconcileCallRecorderForCalendarEventIds({
        client,
        calendarEventIds: [calendarEventId],
      });

      const result = await deliverCalendarEventUpdate({
        calendarEventId,
        updatedFields: ['callRecorderPreference'],
        before: { callRecorderPreference: null },
        after: { callRecorderPreference: 'ON' },
      });

      expect(result).toEqual({
        skipped: true,
        reason: 'preference change on a meeting whose bot is already requested',
      });
    });

    it('schedules a bot when a user sets On on an eligible meeting that has none yet', async () => {
      const calendarEventId = await createCalendarEvent({
        callRecorderPreference: 'ON',
      });

      const result = await deliverCalendarEventUpdate({
        calendarEventId,
        updatedFields: ['callRecorderPreference'],
        before: { callRecorderPreference: null },
        after: { callRecorderPreference: 'ON' },
      });

      expect(result).toEqual(expect.objectContaining({ reconciled: true }));
      expect(await fetchCallRecorderPreference(calendarEventId)).toBe('ON');

      const callRecording = (
        await findCallRecordings({ calendarEventId: { in: [calendarEventId] } })
      )[0];

      expect(callRecording).toBeDefined();
      expect(callRecording.recordingRequestStatus).toBe('REQUESTED');
      expect(callRecording.externalBotId).toBeTruthy();
    });

    it('clears an On set by hand on a meeting that already ended', async () => {
      const calendarEventId = await createCalendarEvent({
        startsAt: hoursAgo(3),
        endsAt: hoursAgo(2),
        callRecorderPreference: 'ON',
      });

      const result = await deliverCalendarEventUpdate({
        calendarEventId,
        updatedFields: ['callRecorderPreference'],
        before: { callRecorderPreference: null },
        after: { callRecorderPreference: 'ON' },
      });

      expect(result).toEqual(expect.objectContaining({ reconciled: true }));
      expect(await fetchCallRecorderPreference(calendarEventId)).toBeNull();
      expect(
        await findCallRecordings({
          calendarEventId: { in: [calendarEventId] },
        }),
      ).toEqual([]);
    });

    it('clears an On set by hand while the workspace recording switch is off', async () => {
      vi.stubEnv(
        CALL_RECORDER_CALENDAR_BOT_SCHEDULING_ENABLED_ENV_VAR_NAME,
        'false',
      );

      const calendarEventId = await createCalendarEvent({
        callRecorderPreference: 'ON',
      });

      const result = await deliverCalendarEventUpdate({
        calendarEventId,
        updatedFields: ['callRecorderPreference'],
        before: { callRecorderPreference: null },
        after: { callRecorderPreference: 'ON' },
      });

      expect(result).toEqual(expect.objectContaining({ reconciled: true }));
      expect(await fetchCallRecorderPreference(calendarEventId)).toBeNull();
      expect(
        await findCallRecordings({
          calendarEventId: { in: [calendarEventId] },
        }),
      ).toEqual([]);
    });

    it('schedules a bot and marks the event On when a user clears an Off', async () => {
      const calendarEventId = await createCalendarEvent({
        callRecorderPreference: 'OFF',
      });

      await client.mutation({
        updateCalendarEvent: {
          __args: {
            id: calendarEventId,
            data: { callRecorderPreference: null },
          },
          id: true,
        },
      });

      const result = await deliverCalendarEventUpdate({
        calendarEventId,
        updatedFields: ['callRecorderPreference'],
        before: { callRecorderPreference: 'OFF' },
        after: { callRecorderPreference: null },
      });

      expect(result).toEqual(expect.objectContaining({ reconciled: true }));
      expect(await fetchCallRecorderPreference(calendarEventId)).toBe('ON');

      const callRecording = (
        await findCallRecordings({ calendarEventId: { in: [calendarEventId] } })
      )[0];

      expect(callRecording).toBeDefined();
      expect(callRecording.recordingRequestStatus).toBe('REQUESTED');
      expect(callRecording.externalBotId).toBeTruthy();
    });

    it('clears an On the meeting no longer earns', async () => {
      const { calendarEventId, callRecordingId } =
        await scheduleRecordingThroughCalendarReconciliation();

      expect(await fetchCallRecorderPreference(calendarEventId)).toBe('ON');

      await client.mutation({
        updateCalendarEvent: {
          __args: { id: calendarEventId, data: { isCanceled: true } },
          id: true,
        },
      });

      await reconcileCallRecorderForCalendarEventIds({
        client,
        calendarEventIds: [calendarEventId],
      });

      expect(await fetchCallRecorderPreference(calendarEventId)).toBeNull();
      expect(
        (await fetchCallRecording(callRecordingId)).recordingRequestStatus,
      ).toBe('CANCELED');
    });

    it('keeps the On of a meeting that was actually recorded', async () => {
      const calendarEventId = await createCalendarEvent({
        startsAt: hoursAgo(3),
        endsAt: hoursAgo(2),
      });

      await createPendingCallRecording({
        calendarEventId,
        status: 'COMPLETED',
      });

      await reconcileCallRecorderForCalendarEventIds({
        client,
        calendarEventIds: [calendarEventId],
      });

      expect(await fetchCallRecorderPreference(calendarEventId)).toBe('ON');
    });
  });

  describe('workspace recording switch', () => {
    const turnRecordingOff = () =>
      vi.stubEnv(
        CALL_RECORDER_CALENDAR_BOT_SCHEDULING_ENABLED_ENV_VAR_NAME,
        'false',
      );

    it('cancels the request inline and leaves the Recall bot to the enqueued job', async () => {
      const { callRecordingId, botId } =
        await scheduleRecordingThroughCalendarReconciliation();

      turnRecordingOff();

      const result = await syncCalendarBotSchedulingHandler();

      expect(result).toEqual(
        expect.objectContaining({ outcome: 'scheduled-bots-canceled' }),
      );
      expect(
        (await fetchCallRecording(callRecordingId)).recordingRequestStatus,
      ).toBe('CANCELED');
      expect(recall.deletedBotIds).not.toContain(botId);

      await cancelScheduledRecallBotsHandler();

      const callRecording = await fetchCallRecording(callRecordingId);

      expect(callRecording.externalBotId).toBeFalsy();
      expect(recall.deletedBotIds).toContain(botId);
    });

    it('stops the cancellation chain when Recall is down, leaving the bot to the daily retry', async () => {
      const { callRecordingId, botId } =
        await scheduleRecordingThroughCalendarReconciliation();

      turnRecordingOff();
      await syncCalendarBotSchedulingHandler();

      recall.failRecallRemovals = true;

      const result = await cancelScheduledRecallBots({ client, sliceSize: 1 });

      expect(result.canceledCallRecordingIds).toEqual([]);
      expect(result.failedCallRecordingIds).toEqual([callRecordingId]);
      expect(result.hasMore).toBe(false);
      expect((await fetchCallRecording(callRecordingId)).externalBotId).toBe(
        botId,
      );
    });

    it('does not schedule a bot for a request the cancellation missed', async () => {
      const calendarEventId = await createCalendarEvent();
      const callRecordingId = await createPendingCallRecording({
        calendarEventId,
      });

      turnRecordingOff();

      await runPendingRecoveryCron();

      const callRecording = await fetchCallRecording(callRecordingId);

      expect(callRecording.externalBotId).toBeFalsy();
      expect(recall.botForCallRecording(callRecordingId)).toBeUndefined();
    });

    it('schedules nothing for an upcoming meeting while turned off', async () => {
      turnRecordingOff();

      const calendarEventId = await createCalendarEvent();

      await reconcileCallRecorderForCalendarEventIds({
        client,
        calendarEventIds: [calendarEventId],
      });

      expect(
        await findCallRecordings({
          calendarEventId: { in: [calendarEventId] },
        }),
      ).toEqual([]);
      expect(recall.bots.size).toBe(0);
    });

    it('clears the Recording Bot preference of the meetings it paused', async () => {
      const { calendarEventId } =
        await scheduleRecordingThroughCalendarReconciliation();

      expect(await fetchCallRecorderPreference(calendarEventId)).toBe('ON');

      turnRecordingOff();
      await syncCalendarBotSchedulingHandler();
      await reconcileCallRecorderForCalendarEventIds({
        client,
        calendarEventIds: [calendarEventId],
      });

      expect(await fetchCallRecorderPreference(calendarEventId)).toBeNull();
    });

    it('restores the bot when a user sets On after a pause left a canceled request', async () => {
      const { calendarEventId, callRecordingId } =
        await scheduleRecordingThroughCalendarReconciliation();

      turnRecordingOff();
      await syncCalendarBotSchedulingHandler();
      await reconcileCallRecorderForCalendarEventIds({
        client,
        calendarEventIds: [calendarEventId],
      });

      expect(
        (await fetchCallRecording(callRecordingId)).recordingRequestStatus,
      ).toBe('CANCELED');

      vi.unstubAllEnvs();

      await client.mutation({
        updateCalendarEvent: {
          __args: {
            id: calendarEventId,
            data: { callRecorderPreference: 'ON' },
          },
          id: true,
        },
      });

      const result = await deliverCalendarEventUpdate({
        calendarEventId,
        updatedFields: ['callRecorderPreference'],
        before: { callRecorderPreference: null },
        after: { callRecorderPreference: 'ON' },
      });

      expect(result).toEqual(expect.objectContaining({ reconciled: true }));

      const callRecording = await fetchCallRecording(callRecordingId);

      expect(callRecording.recordingRequestStatus).toBe('REQUESTED');
      expect(callRecording.externalBotId).toBeTruthy();
      expect(await fetchCallRecorderPreference(calendarEventId)).toBe('ON');
    });

    it('enqueues the upcoming-events sweep when turned back on', async () => {
      vi.stubEnv(
        CALL_RECORDER_CALENDAR_BOT_SCHEDULING_ENABLED_ENV_VAR_NAME,
        'true',
      );

      await expect(syncCalendarBotSchedulingHandler()).resolves.toEqual({
        outcome: 'sweep-enqueued',
      });
    });
  });
});
