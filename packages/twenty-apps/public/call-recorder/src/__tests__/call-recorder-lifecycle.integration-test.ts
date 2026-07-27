import { randomUUID } from 'crypto';

import { CoreApiClient } from 'twenty-client-sdk/core';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { cancelCallRecordingRequest } from 'src/logic-functions/flows/cancel-call-recording-request.util';
import { reconcileCallRecorderForCalendarEventIds } from 'src/logic-functions/flows/reconcile-call-recorder.util';
import { retryFailedRecallCancellations } from 'src/logic-functions/flows/retry-failed-recall-cancellations.util';
import { scheduleRecallBotsForPendingCallRecordings } from 'src/logic-functions/flows/schedule-recall-bots-for-pending-call-recordings.util';
import { processRecallWebhookHandler } from 'src/logic-functions/process-recall-webhook';

// ---------------------------------------------------------------------------
// Call Recorder end-to-end behavior against a live Twenty server.
//
// The app is installed on the test server by the vitest global setup, and all
// reads and writes go through the real API into the test database. Only the
// externals are mocked:
//   - the Recall API (a fetch interceptor that replays the same bot for a
//     repeated Idempotency-Key, like the real API),
//   - the trigger transports: webhook deliveries invoke the webhook logic
//     function handler directly, and cron / database-event triggers invoke
//     the flows they dispatch.
//
// Every scenario then asserts the resulting CallRecording rows in the DB.
//
// The suite issues a few hundred API requests; if the test server runs with
// the default API_RATE_LIMITING_LONG_LIMIT of 100 requests per minute,
// raise it (e.g. to 100000) or the runs trip the limiter.
// ---------------------------------------------------------------------------

const WORKSPACE_API_KEY_ENV = 'TWENTY_API_KEY';
const RECALL_BASE_URL = 'https://us-west-2.recall.ai/api/v1';
const FUNCTIONS_URL = 'https://call-recorder-functions.test';
const ARTIFACT_IMPORT_ROUTE = '/call-recorder/import-call-recording-artifacts';
const RESTRICTED_TITLE_PLACEHOLDER =
  'FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED';

// The app's generated client only covers the objects the app uses, but test
// seeding also needs calendarChannelEventAssociations (see below); this hits
// the workspace GraphQL API directly with the test API key.
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

// Calendar events are only readable when a calendar channel with
// SHARE_EVERYTHING visibility claims them, exactly like events coming from a
// real calendar sync. The dev seeds provide such a channel; it is found by
// following a fully visible seeded event to its channel association.
const discoverShareEverythingChannelId = async (): Promise<string> => {
  const eventsData = await workspaceGraphql(
    `query { calendarEvents(first: 30) { edges { node { id title } } } }`,
  );
  const visibleEvent = eventsData.calendarEvents.edges
    .map((edge: any) => edge.node)
    .find(
      (node: any) =>
        node.title !== null && node.title !== RESTRICTED_TITLE_PLACEHOLDER,
    );

  if (visibleEvent === undefined) {
    throw new Error(
      'No fully visible seeded calendar event found; run the dev seeds before the integration tests',
    );
  }

  const associationsData = await workspaceGraphql(
    `query ($calendarEventId: UUID) {
      calendarChannelEventAssociations(
        filter: { calendarEventId: { eq: $calendarEventId } }
        first: 1
      ) { edges { node { calendarChannelId } } }
    }`,
    { calendarEventId: visibleEvent.id },
  );
  const channelId =
    associationsData.calendarChannelEventAssociations.edges[0]?.node
      ?.calendarChannelId;

  if (channelId === undefined) {
    throw new Error('Seeded visible calendar event has no channel association');
  }

  return channelId;
};

const inOneHour = () => new Date(Date.now() + 60 * 60 * 1000).toISOString();
const inTwoHours = () => new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
const hoursAgo = (hours: number) =>
  new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

// ---------------------------------------------------------------------------
// Recall API fake, installed as a fetch interceptor. Twenty API traffic is
// never intercepted: the shared client is built before the interceptor and
// unknown URLs fall through to the real fetch.
// ---------------------------------------------------------------------------

type FakeRecallBot = {
  id: string;
  metadata: Record<string, string>;
  statusCode: string;
};

class FakeRecallApi {
  bots = new Map<string, FakeRecallBot>();
  botIdByIdempotencyKey = new Map<string, string>();
  deletedBotIds: string[] = [];
  listRequestCount = 0;
  artifactImportRequests: object[] = [];
  failNextDelete = false;

  seedBot(bot: FakeRecallBot): void {
    this.bots.set(bot.id, bot);
  }

  botForCallRecording(callRecordingId: string): FakeRecallBot | undefined {
    return [...this.bots.values()].find(
      (bot) => bot.metadata.twentyCallRecordingId === callRecordingId,
    );
  }

  handle(requestUrl: string, requestInit?: any): Response | undefined {
    const method: string = requestInit?.method ?? 'GET';

    if (requestUrl.startsWith(`${FUNCTIONS_URL}${ARTIFACT_IMPORT_ROUTE}`)) {
      this.artifactImportRequests.push(JSON.parse(requestInit?.body ?? '{}'));

      return jsonResponse(200, {});
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
        })),
      });
    }

    const botIdMatch = requestUrl.match(/\/bot\/([^/]+)\/$/);

    if (method === 'DELETE' && botIdMatch !== null) {
      if (this.failNextDelete) {
        this.failNextDelete = false;

        return jsonResponse(400, {});
      }

      this.bots.delete(botIdMatch[1]);
      this.deletedBotIds.push(botIdMatch[1]);

      return new Response(null, { status: 204 });
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
  statusTimestamp,
}: {
  botId: string;
  metadata: Record<string, string>;
  statusCode: string;
  statusTimestamp?: string;
}) => ({
  event: 'bot.status_change',
  data: {
    bot_id: botId,
    status: {
      code: statusCode,
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
// Test workspace helpers: real rows in the test database, destroyed after
// each scenario.
// ---------------------------------------------------------------------------

describe('call recorder app lifecycle (integration)', () => {
  // Built before the fetch interceptor is installed so the shared client's
  // Twenty API traffic always uses the real fetch.
  let client: CoreApiClient;
  let workspaceId: string;
  let shareEverythingChannelId: string;
  let recall: FakeRecallApi;
  const createdCalendarEventIds: string[] = [];
  const createdCallRecordingIds: string[] = [];
  const createdAssociationIds: string[] = [];

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
    shareEverythingChannelId = await discoverShareEverythingChannelId();
  });

  beforeEach(() => {
    recall = new FakeRecallApi();

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
    vi.stubEnv('TWENTY_FUNCTIONS_URL', FUNCTIONS_URL);
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
    const callRecordingsForCreatedCalendarEvents =
      createdCalendarEventIds.length === 0
        ? []
        : await findCallRecordings({
            calendarEventId: { in: createdCalendarEventIds },
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

    for (const associationId of createdAssociationIds) {
      await workspaceGraphql(
        `mutation ($id: UUID!) {
          destroyCalendarChannelEventAssociation(id: $id) { id }
        }`,
        { id: associationId },
      ).catch(() => {});
    }

    for (const calendarEventId of createdCalendarEventIds) {
      await client
        .mutation({
          destroyCalendarEvent: { __args: { id: calendarEventId }, id: true },
        })
        .catch(() => {});
    }

    createdCalendarEventIds.length = 0;
    createdCallRecordingIds.length = 0;
    createdAssociationIds.length = 0;
  };

  const createCalendarEvent = async (
    overrides: Record<string, unknown> = {},
  ): Promise<string> => {
    const calendarEventId = randomUUID();

    await client.mutation({
      createCalendarEvent: {
        __args: {
          data: {
            id: calendarEventId,
            title: 'Customer Sync (call recorder integration test)',
            startsAt: inOneHour(),
            endsAt: inTwoHours(),
            iCalUid: `call-recorder-test-${calendarEventId}`,
            conferenceLink: {
              primaryLinkUrl: `https://meet.google.com/${calendarEventId}`,
            },
            callRecorderPreference: 'ON',
            ...overrides,
          },
        },
        id: true,
      },
    });
    createdCalendarEventIds.push(calendarEventId);

    // Without a SHARE_EVERYTHING channel association the event would be
    // invisible to every query, like an event no calendar sync produced.
    const associationData = await workspaceGraphql(
      `mutation ($data: CalendarChannelEventAssociationCreateInput!) {
        createCalendarChannelEventAssociation(data: $data) { id }
      }`,
      {
        data: {
          calendarChannelId: shareEverythingChannelId,
          calendarEventId,
          eventExternalId: `call-recorder-test-${calendarEventId}`,
        },
      },
    );

    createdAssociationIds.push(
      associationData.createCalendarChannelEventAssociation.id,
    );

    return calendarEventId;
  };

  const createPendingCallRecording = async ({
    calendarEventId,
    ...overrides
  }: Record<string, unknown> & { calendarEventId: string }): Promise<string> => {
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
          },
        },
      },
    });

    return (result.callRecordings?.edges ?? []).map(
      (edge: any) => edge.node,
    );
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

    await reconcileCallRecorderForCalendarEventIds({
      client,
      calendarEventIds: [calendarEventId],
    });

    const callRecording = (
      await findCallRecordings({ calendarEventId: { in: [calendarEventId] } })
    )[0];

    expect(callRecording).toBeDefined();
    expect(callRecording.externalBotId).toBeTruthy();

    return {
      calendarEventId,
      callRecordingId: callRecording.id,
      botId: callRecording.externalBotId,
      metadata: buildBotMetadata(callRecording.id, workspaceId),
    };
  };

  // Mocked webhook trigger: invokes the webhook logic function handler with
  // the payload Recall would have delivered.
  const deliverRecallWebhook = (body: object) =>
    processRecallWebhookHandler(body);

  // Mocked cron trigger: runs the flows the recovery cron dispatches.
  const runPendingRecoveryCron = () =>
    scheduleRecallBotsForPendingCallRecordings({ client, now: new Date() });
  const runCancellationRetryCron = () =>
    retryFailedRecallCancellations({ client, now: new Date() });

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
        await findCallRecordings({ calendarEventId: { in: [calendarEventId] } }),
      ).toEqual([]);
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
      // recording.done hands media and transcript work to the artifact
      // import route.
      expect(recall.artifactImportRequests).toHaveLength(1);
      expect(recall.artifactImportRequests[0]).toMatchObject({
        callRecordingId,
      });
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

      expect(recall.artifactImportRequests).toHaveLength(2);
      expect(recall.artifactImportRequests[1]).toMatchObject({
        callRecordingId,
      });
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
});
