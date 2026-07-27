import { type CoreApiClient } from 'twenty-client-sdk/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { computeCallRecordingIdForMeeting } from 'src/logic-functions/domain/compute-call-recording-id-for-meeting.util';
import { reconcileCallRecorderForCalendarEventIds } from 'src/logic-functions/flows/reconcile-call-recorder.util';

const fetchMock = vi.fn();

const NOW = new Date('2026-01-01T12:00:00.000Z');
const WORKSPACE_ID = '123e4567-e89b-12d3-a456-426614174000';
const FUTURE_STARTS_AT = '2026-01-01T13:00:00.000Z';
const FUTURE_RECALL_BOT_JOIN_AT = '2026-01-01T12:59:00.000Z';
const FUTURE_ENDS_AT = '2026-01-01T14:00:00.000Z';
const RECALL_API_BASE_URL = 'https://us-west-2.recall.ai/api/v1';

const buildAccessToken = (payload: Record<string, unknown>): string =>
  [
    Buffer.from(JSON.stringify({ alg: 'none' })).toString('base64url'),
    Buffer.from(JSON.stringify(payload)).toString('base64url'),
    'signature',
  ].join('.');

type RecallFetchCall = [
  requestUrl: string,
  requestInit: {
    method: string;
    headers: Record<string, string>;
    body?: string;
  },
];

const recallFetchCalls = (method: string): RecallFetchCall[] =>
  (fetchMock.mock.calls as RecallFetchCall[]).filter(
    ([, requestInit]) => requestInit.method === method,
  );

const recallBotCreateCalls = (): RecallFetchCall[] => recallFetchCalls('POST');
const recallBotUpdateCalls = (): RecallFetchCall[] => recallFetchCalls('PATCH');
const recallBotDeleteCalls = (): RecallFetchCall[] =>
  recallFetchCalls('DELETE');

const buildCustomerSyncCallRecordingId = (
  startsAt: string = FUTURE_STARTS_AT,
): string =>
  computeCallRecordingIdForMeeting(
    `link:meet.google.com/customer-sync:${startsAt}`,
  );

type CalendarEventNode = {
  id: string;
  title?: string | null;
  isCanceled?: boolean | null;
  startsAt?: string | null;
  endsAt?: string | null;
  iCalUid?: string | null;
  conferenceLink?: { primaryLinkUrl?: string | null } | null;
  callRecorderPreference?: string | null;
};

type CallRecordingNode = {
  id: string;
  title?: string | null;
  status?: string | null;
  recordingRequestStatus?: string | null;
  startedAt?: string | null;
  endedAt?: string | null;
  calendarEventId?: string | null;
  externalBotId?: string | null;
  externalRecordingId?: string | null;
};

type FakeCoreApiClientFixture = {
  calendarEvents: CalendarEventNode[];
  callRecordings?: CallRecordingNode[];
};

class FakeCoreApiClient {
  calendarEvents: CalendarEventNode[];
  callRecordings: CallRecordingNode[];
  mutations: Array<{ name: string; args: unknown }> = [];

  constructor({
    calendarEvents,
    callRecordings = [],
  }: FakeCoreApiClientFixture) {
    this.calendarEvents = calendarEvents;
    this.callRecordings = callRecordings;
  }

  async query(query: any): Promise<any> {
    if (query.calendarEvents !== undefined) {
      return {
        calendarEvents: buildConnection(
          this.filterCalendarEvents(query.calendarEvents.__args.filter),
        ),
      };
    }

    if (query.callRecordings !== undefined) {
      const filter = query.callRecordings.__args.filter;

      if (filter.id?.in !== undefined) {
        return {
          callRecordings: buildConnection(
            this.callRecordings.filter((callRecording) =>
              filter.id.in.includes(callRecording.id),
            ),
          ),
        };
      }

      return {
        callRecordings: buildConnection(
          this.callRecordings.filter((callRecording) =>
            filter.calendarEventId.in.includes(callRecording.calendarEventId),
          ),
        ),
      };
    }

    throw new Error(`Unhandled query: ${JSON.stringify(query)}`);
  }

  async mutation(mutation: any): Promise<any> {
    if (mutation.createCallRecording !== undefined) {
      const data = mutation.createCallRecording.__args.data;

      if (this.callRecordings.some((candidate) => candidate.id === data.id)) {
        throw new Error(`Duplicate call recording id ${data.id}`);
      }

      const createdCallRecording = { ...data };

      this.callRecordings.push(createdCallRecording);
      this.mutations.push({
        name: 'createCallRecording',
        args: data,
      });

      return {
        createCallRecording: {
          id: createdCallRecording.id,
        },
      };
    }

    if (mutation.updateCallRecording !== undefined) {
      const { id, data } = mutation.updateCallRecording.__args;
      const callRecording = this.callRecordings.find(
        (candidate) => candidate.id === id,
      );

      if (callRecording === undefined) {
        throw new Error(`Could not find call recording ${id}`);
      }

      Object.assign(callRecording, data);
      this.mutations.push({
        name: 'updateCallRecording',
        args: { id, data },
      });

      return {
        updateCallRecording: {
          id,
        },
      };
    }

    throw new Error(`Unhandled mutation: ${JSON.stringify(mutation)}`);
  }

  private filterCalendarEvents(filter: any): CalendarEventNode[] {
    if (filter.id?.in !== undefined) {
      return this.calendarEvents.filter((calendarEvent) =>
        filter.id.in.includes(calendarEvent.id),
      );
    }

    if (filter.startsAt?.in !== undefined) {
      return this.calendarEvents.filter((calendarEvent) =>
        filter.startsAt.in.includes(calendarEvent.startsAt),
      );
    }

    throw new Error(
      `Unhandled calendar event filter: ${JSON.stringify(filter)}`,
    );
  }
}

const buildConnection = <Node>(nodes: Node[]) => ({
  pageInfo: {
    hasNextPage: false,
    endCursor: undefined,
  },
  edges: nodes.map((node) => ({ node })),
});

const buildCalendarEvent = (
  overrides: Partial<CalendarEventNode> = {},
): CalendarEventNode => ({
  id: 'calendar-event-1',
  title: 'Customer Sync',
  isCanceled: false,
  startsAt: FUTURE_STARTS_AT,
  endsAt: FUTURE_ENDS_AT,
  iCalUid: 'calendar-event-uid',
  conferenceLink: {
    primaryLinkUrl: 'https://meet.google.com/customer-sync',
  },
  callRecorderPreference: 'ON',
  ...overrides,
});

const buildFakeCoreApiClient = (
  fixture: FakeCoreApiClientFixture,
): FakeCoreApiClient => new FakeCoreApiClient(fixture);

describe('reconcileCallRecorderForCalendarEventIds', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv(
      'TWENTY_APP_ACCESS_TOKEN',
      buildAccessToken({ workspaceId: WORKSPACE_ID }),
    );
    vi.stubEnv('RECALL_API_KEY', 'recall-api-key');
    vi.stubEnv('RECALL_REGION', 'us-west-2');
    vi.stubEnv('CALL_RECORDER_USE_WORKSPACE_LOGO', 'false');
    fetchMock.mockReset();
    fetchMock.mockImplementation(
      async (requestUrl: string, requestInit: RequestInit) => {
        if (requestInit.method === 'POST' || requestInit.method === 'PATCH') {
          return new Response(JSON.stringify({ id: 'recall-bot-1' }), {
            status: 200,
          });
        }

        if (requestInit.method === 'DELETE') {
          return new Response(null, { status: 204 });
        }

        throw new Error(`Unhandled fetch: ${requestInit.method} ${requestUrl}`);
      },
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('creates a scheduled call recording when the policy requests a bot', async () => {
    const client = buildFakeCoreApiClient({
      calendarEvents: [buildCalendarEvent()],
    });

    const result = await reconcileCallRecorderForCalendarEventIds({
      client: client as unknown as CoreApiClient,
      calendarEventIds: ['calendar-event-1'],
      now: NOW,
    });

    expect(result).toEqual([
      expect.objectContaining({
        action: 'CREATED',
        callRecordingId: buildCustomerSyncCallRecordingId(),
      }),
    ]);
    expect(client.callRecordings).toEqual([
      {
        id: buildCustomerSyncCallRecordingId(),
        title: 'Customer Sync',
        status: 'SCHEDULED',
        recordingRequestStatus: 'REQUESTED',
        calendarEventId: 'calendar-event-1',
        externalBotId: 'recall-bot-1',
        botScheduleAttemptedAt: NOW.toISOString(),
        botScheduleIdempotencyKey: expect.any(String),
      },
    ]);
    expect(recallBotCreateCalls()).toHaveLength(1);
    const [createBotUrl, createBotInit] = recallBotCreateCalls()[0];
    expect(createBotUrl).toBe(`${RECALL_API_BASE_URL}/bot/`);
    expect(createBotInit.headers).toEqual(
      expect.objectContaining({ Authorization: 'Token recall-api-key' }),
    );
    expect(JSON.parse(createBotInit.body ?? '')).toEqual(
      expect.objectContaining({
        meeting_url: 'https://meet.google.com/customer-sync',
        join_at: FUTURE_RECALL_BOT_JOIN_AT,
        metadata: {
          twentyWorkspaceId: WORKSPACE_ID,
          twentyCallRecordingId: buildCustomerSyncCallRecordingId(),
        },
      }),
    );
  });

  it('creates a scheduled call recording with a fallback title when the calendar title is unavailable', async () => {
    const client = buildFakeCoreApiClient({
      calendarEvents: [buildCalendarEvent({ title: undefined })],
    });

    const result = await reconcileCallRecorderForCalendarEventIds({
      client: client as unknown as CoreApiClient,
      calendarEventIds: ['calendar-event-1'],
      now: NOW,
    });

    expect(result).toEqual([
      expect.objectContaining({
        action: 'CREATED',
        callRecordingId: buildCustomerSyncCallRecordingId(),
      }),
    ]);
    expect(client.callRecordings).toEqual([
      expect.objectContaining({
        title: 'Call recording - Jan 1, 2026, 1:00 PM UTC',
        status: 'SCHEDULED',
        recordingRequestStatus: 'REQUESTED',
      }),
    ]);
  });

  it('creates a scheduled call recording for the default ON preference', async () => {
    const client = buildFakeCoreApiClient({
      calendarEvents: [buildCalendarEvent({ callRecorderPreference: null })],
    });

    const result = await reconcileCallRecorderForCalendarEventIds({
      client: client as unknown as CoreApiClient,
      calendarEventIds: ['calendar-event-1'],
      now: NOW,
    });

    expect(result).toEqual([
      expect.objectContaining({
        action: 'CREATED',
        callRecordingId: buildCustomerSyncCallRecordingId(),
      }),
    ]);
    expect(recallBotCreateCalls()).toHaveLength(1);
  });

  it('creates a recording for an in-progress meeting that has not ended', async () => {
    const client = buildFakeCoreApiClient({
      calendarEvents: [
        buildCalendarEvent({
          callRecorderPreference: null,
          startsAt: '2026-01-01T11:30:00.000Z',
          endsAt: '2026-01-01T13:00:00.000Z',
        }),
      ],
    });

    const result = await reconcileCallRecorderForCalendarEventIds({
      client: client as unknown as CoreApiClient,
      calendarEventIds: ['calendar-event-1'],
      now: NOW,
    });

    expect(result).toEqual([
      expect.objectContaining({
        action: 'CREATED',
        callRecordingId: buildCustomerSyncCallRecordingId(
          '2026-01-01T11:30:00.000Z',
        ),
      }),
    ]);
    expect(recallBotCreateCalls()).toHaveLength(1);
  });

  it('updates an existing in-progress recording', async () => {
    const client = buildFakeCoreApiClient({
      calendarEvents: [
        buildCalendarEvent({
          callRecorderPreference: null,
          title: 'Updated Customer Sync',
          startsAt: '2026-01-01T11:30:00.000Z',
          endsAt: '2026-01-01T13:00:00.000Z',
        }),
      ],
      callRecordings: [
        {
          id: buildCustomerSyncCallRecordingId('2026-01-01T11:30:00.000Z'),
          title: 'Old Customer Sync',
          status: 'SCHEDULED',
          recordingRequestStatus: 'REQUESTED',
          calendarEventId: 'calendar-event-1',
          externalBotId: 'recall-bot-1',
        },
      ],
    });

    const result = await reconcileCallRecorderForCalendarEventIds({
      client: client as unknown as CoreApiClient,
      calendarEventIds: ['calendar-event-1'],
      now: NOW,
    });

    expect(result).toEqual([
      expect.objectContaining({
        action: 'UPDATED',
        callRecordingId: buildCustomerSyncCallRecordingId(
          '2026-01-01T11:30:00.000Z',
        ),
      }),
    ]);
    expect(client.callRecordings).toEqual([
      expect.objectContaining({
        title: 'Updated Customer Sync',
        recordingRequestStatus: 'REQUESTED',
      }),
    ]);
  });

  it('updates an existing policy-managed scheduled call recording', async () => {
    const client = buildFakeCoreApiClient({
      calendarEvents: [
        buildCalendarEvent({
          title: 'Updated Customer Sync',
        }),
      ],
      callRecordings: [
        {
          id: buildCustomerSyncCallRecordingId(),
          title: 'Old Customer Sync',
          status: 'SCHEDULED',
          recordingRequestStatus: 'REQUESTED',
          startedAt: FUTURE_STARTS_AT,
          endedAt: FUTURE_ENDS_AT,
          calendarEventId: 'calendar-event-1',
          externalBotId: 'recall-bot-1',
        },
      ],
    });

    const result = await reconcileCallRecorderForCalendarEventIds({
      client: client as unknown as CoreApiClient,
      calendarEventIds: ['calendar-event-1'],
      now: NOW,
    });

    expect(result).toEqual([
      expect.objectContaining({
        action: 'UPDATED',
        callRecordingId: buildCustomerSyncCallRecordingId(),
      }),
    ]);
    expect(client.callRecordings).toEqual([
      expect.objectContaining({
        id: buildCustomerSyncCallRecordingId(),
        title: 'Updated Customer Sync',
        status: 'SCHEDULED',
        recordingRequestStatus: 'REQUESTED',
        startedAt: FUTURE_STARTS_AT,
        endedAt: FUTURE_ENDS_AT,
        calendarEventId: 'calendar-event-1',
        externalBotId: 'recall-bot-1',
      }),
    ]);
    expect(recallBotUpdateCalls()).toHaveLength(1);
    const [updateBotUrl, updateBotInit] = recallBotUpdateCalls()[0];
    expect(updateBotUrl).toBe(`${RECALL_API_BASE_URL}/bot/recall-bot-1/`);
    expect(JSON.parse(updateBotInit.body ?? '')).toEqual(
      expect.objectContaining({
        meeting_url: 'https://meet.google.com/customer-sync',
        join_at: FUTURE_RECALL_BOT_JOIN_AT,
        metadata: {
          twentyWorkspaceId: WORKSPACE_ID,
          twentyCallRecordingId: buildCustomerSyncCallRecordingId(),
        },
      }),
    );
  });

  it('replaces a stale visible title with the fallback title when the calendar title becomes unavailable', async () => {
    const client = buildFakeCoreApiClient({
      calendarEvents: [buildCalendarEvent({ title: undefined })],
      callRecordings: [
        {
          id: buildCustomerSyncCallRecordingId(),
          title: 'Old Customer Sync',
          status: 'SCHEDULED',
          recordingRequestStatus: 'REQUESTED',
          startedAt: FUTURE_STARTS_AT,
          endedAt: FUTURE_ENDS_AT,
          calendarEventId: 'calendar-event-1',
          externalBotId: 'recall-bot-1',
        },
      ],
    });

    const result = await reconcileCallRecorderForCalendarEventIds({
      client: client as unknown as CoreApiClient,
      calendarEventIds: ['calendar-event-1'],
      now: NOW,
    });

    expect(result).toEqual([
      expect.objectContaining({
        action: 'UPDATED',
        callRecordingId: buildCustomerSyncCallRecordingId(),
      }),
    ]);
    expect(client.callRecordings).toEqual([
      expect.objectContaining({
        title: 'Call recording - Jan 1, 2026, 1:00 PM UTC',
        status: 'SCHEDULED',
        recordingRequestStatus: 'REQUESTED',
      }),
    ]);
  });

  it('cancels an existing scheduled request when the policy no longer requests a bot', async () => {
    const client = buildFakeCoreApiClient({
      calendarEvents: [
        buildCalendarEvent({
          callRecorderPreference: 'OFF',
        }),
      ],
      callRecordings: [
        {
          id: 'call-recording-1',
          title: 'Customer Sync',
          status: 'SCHEDULED',
          recordingRequestStatus: 'REQUESTED',
          startedAt: FUTURE_STARTS_AT,
          endedAt: FUTURE_ENDS_AT,
          calendarEventId: 'calendar-event-1',
          externalBotId: 'recall-bot-1',
        },
      ],
    });

    const result = await reconcileCallRecorderForCalendarEventIds({
      client: client as unknown as CoreApiClient,
      calendarEventIds: ['calendar-event-1'],
      now: NOW,
    });

    expect(result).toEqual([
      expect.objectContaining({
        action: 'CANCELED',
        callRecordingId: 'call-recording-1',
      }),
    ]);
    expect(client.callRecordings).toEqual([
      expect.objectContaining({
        id: 'call-recording-1',
        recordingRequestStatus: 'CANCELED',
        externalBotId: null,
      }),
    ]);
    expect(recallBotDeleteCalls().map(([requestUrl]) => requestUrl)).toEqual([
      `${RECALL_API_BASE_URL}/bot/recall-bot-1/`,
    ]);
  });

  it('persists the cancel intent and leaves the bot for the planned stale-state cron when the Recall cancel fails', async () => {
    vi.useFakeTimers();
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ detail: 'server error' }), {
        status: 500,
      }),
    );

    const client = buildFakeCoreApiClient({
      calendarEvents: [
        buildCalendarEvent({
          callRecorderPreference: 'OFF',
        }),
      ],
      callRecordings: [
        {
          id: 'call-recording-1',
          title: 'Customer Sync',
          status: 'SCHEDULED',
          recordingRequestStatus: 'REQUESTED',
          startedAt: FUTURE_STARTS_AT,
          endedAt: FUTURE_ENDS_AT,
          calendarEventId: 'calendar-event-1',
          externalBotId: 'recall-bot-1',
        },
      ],
    });

    const resultPromise = reconcileCallRecorderForCalendarEventIds({
      client: client as unknown as CoreApiClient,
      calendarEventIds: ['calendar-event-1'],
      now: NOW,
    });

    await vi.runAllTimersAsync();

    const result = await resultPromise;

    expect(result).toEqual([
      expect.objectContaining({
        action: 'CANCELED',
        callRecordingId: 'call-recording-1',
      }),
    ]);
    expect(client.callRecordings).toEqual([
      expect.objectContaining({
        id: 'call-recording-1',
        recordingRequestStatus: 'CANCELED',
        externalBotId: 'recall-bot-1',
      }),
    ]);
  });

  it('does not reset the status of a recording whose bot is already live', async () => {
    const client = buildFakeCoreApiClient({
      calendarEvents: [
        buildCalendarEvent({
          title: 'Renamed Customer Sync',
        }),
      ],
      callRecordings: [
        {
          id: buildCustomerSyncCallRecordingId(),
          title: 'Customer Sync',
          status: 'JOINING',
          recordingRequestStatus: 'REQUESTED',
          startedAt: FUTURE_STARTS_AT,
          endedAt: FUTURE_ENDS_AT,
          calendarEventId: 'calendar-event-1',
          externalBotId: 'recall-bot-1',
        },
      ],
    });

    const result = await reconcileCallRecorderForCalendarEventIds({
      client: client as unknown as CoreApiClient,
      calendarEventIds: ['calendar-event-1'],
      now: NOW,
    });

    expect(result).toEqual([
      expect.objectContaining({
        action: 'UPDATED',
        callRecordingId: buildCustomerSyncCallRecordingId(),
      }),
    ]);
    expect(client.callRecordings).toEqual([
      expect.objectContaining({
        id: buildCustomerSyncCallRecordingId(),
        title: 'Renamed Customer Sync',
        status: 'JOINING',
      }),
    ]);
  });

  it('creates a single recording when duplicate synced rows share the same real meeting', async () => {
    const client = buildFakeCoreApiClient({
      calendarEvents: [
        buildCalendarEvent(),
        buildCalendarEvent({
          id: 'calendar-event-2',
          iCalUid: 'calendar-event-uid-from-other-channel',
        }),
      ],
    });

    const result = await reconcileCallRecorderForCalendarEventIds({
      client: client as unknown as CoreApiClient,
      calendarEventIds: ['calendar-event-1'],
      now: NOW,
    });

    expect(result).toEqual([
      expect.objectContaining({
        action: 'CREATED',
        callRecordingId: buildCustomerSyncCallRecordingId(),
      }),
    ]);
    expect(client.callRecordings).toHaveLength(1);
    expect(recallBotCreateCalls()).toHaveLength(1);
  });

  it('does not create a duplicate when a non-policy-managed open recording already exists', async () => {
    const client = buildFakeCoreApiClient({
      calendarEvents: [buildCalendarEvent()],
      callRecordings: [
        {
          id: 'call-recording-1',
          title: 'Manual Recording',
          status: 'SCHEDULED',
          recordingRequestStatus: null,
          startedAt: FUTURE_STARTS_AT,
          endedAt: FUTURE_ENDS_AT,
          calendarEventId: 'calendar-event-1',
        },
      ],
    });

    const result = await reconcileCallRecorderForCalendarEventIds({
      client: client as unknown as CoreApiClient,
      calendarEventIds: ['calendar-event-1'],
      now: NOW,
    });

    expect(result).toEqual([
      expect.objectContaining({
        action: 'SKIPPED',
        callRecordingId: 'call-recording-1',
      }),
    ]);
    expect(client.callRecordings).toHaveLength(1);
    expect(client.mutations).toEqual([]);
    expect(recallBotCreateCalls()).toHaveLength(0);
  });

  it('cancels the scheduled request when the calendar event is deleted', async () => {
    const client = buildFakeCoreApiClient({
      calendarEvents: [],
      callRecordings: [
        {
          id: 'call-recording-1',
          title: 'Customer Sync',
          status: 'SCHEDULED',
          recordingRequestStatus: 'REQUESTED',
          startedAt: FUTURE_STARTS_AT,
          endedAt: FUTURE_ENDS_AT,
          calendarEventId: 'calendar-event-1',
          externalBotId: 'recall-bot-1',
        },
      ],
    });

    const result = await reconcileCallRecorderForCalendarEventIds({
      client: client as unknown as CoreApiClient,
      calendarEventIds: [],
      removedOccurrences: [
        {
          calendarEventId: 'calendar-event-1',
          realMeetingKey: `link:meet.google.com/customer-sync:${FUTURE_STARTS_AT}`,
          startsAt: FUTURE_STARTS_AT,
        },
      ],
      now: NOW,
    });

    expect(result).toEqual([
      expect.objectContaining({
        action: 'CANCELED',
        callRecordingId: 'call-recording-1',
      }),
    ]);
    expect(client.callRecordings).toEqual([
      expect.objectContaining({
        id: 'call-recording-1',
        recordingRequestStatus: 'CANCELED',
        externalBotId: null,
      }),
    ]);
    expect(recallBotDeleteCalls().map(([requestUrl]) => requestUrl)).toEqual([
      `${RECALL_API_BASE_URL}/bot/recall-bot-1/`,
    ]);
  });

  it('cancels the old occurrence and creates a fresh recording when the meeting moves to a new time', async () => {
    const NEW_STARTS_AT = '2026-01-02T13:00:00.000Z';
    const NEW_RECALL_BOT_JOIN_AT = '2026-01-02T12:59:00.000Z';
    const NEW_ENDS_AT = '2026-01-02T14:00:00.000Z';
    const client = buildFakeCoreApiClient({
      calendarEvents: [
        buildCalendarEvent({
          startsAt: NEW_STARTS_AT,
          endsAt: NEW_ENDS_AT,
        }),
      ],
      callRecordings: [
        {
          id: buildCustomerSyncCallRecordingId(),
          title: 'Customer Sync',
          status: 'SCHEDULED',
          recordingRequestStatus: 'REQUESTED',
          startedAt: FUTURE_STARTS_AT,
          endedAt: FUTURE_ENDS_AT,
          calendarEventId: 'calendar-event-1',
          externalBotId: 'recall-bot-old',
        },
      ],
    });

    const result = await reconcileCallRecorderForCalendarEventIds({
      client: client as unknown as CoreApiClient,
      calendarEventIds: ['calendar-event-1'],
      removedOccurrences: [
        {
          calendarEventId: 'calendar-event-1',
          realMeetingKey: `link:meet.google.com/customer-sync:${FUTURE_STARTS_AT}`,
          startsAt: FUTURE_STARTS_AT,
        },
      ],
      now: NOW,
    });

    expect(result).toEqual([
      expect.objectContaining({
        action: 'CANCELED',
        callRecordingId: buildCustomerSyncCallRecordingId(),
      }),
      expect.objectContaining({
        action: 'CREATED',
        callRecordingId: buildCustomerSyncCallRecordingId(NEW_STARTS_AT),
      }),
    ]);
    expect(recallBotDeleteCalls().map(([requestUrl]) => requestUrl)).toEqual([
      `${RECALL_API_BASE_URL}/bot/recall-bot-old/`,
    ]);
    expect(recallBotCreateCalls()).toHaveLength(1);
    expect(JSON.parse(recallBotCreateCalls()[0][1].body ?? '')).toEqual(
      expect.objectContaining({ join_at: NEW_RECALL_BOT_JOIN_AT }),
    );
    expect(client.callRecordings).toEqual([
      expect.objectContaining({
        id: buildCustomerSyncCallRecordingId(),
        recordingRequestStatus: 'CANCELED',
        externalBotId: null,
      }),
      expect.objectContaining({
        id: buildCustomerSyncCallRecordingId(NEW_STARTS_AT),
        recordingRequestStatus: 'REQUESTED',
        externalBotId: 'recall-bot-1',
      }),
    ]);
  });

  it('reconciles the remaining meetings when one meeting fails', async () => {
    // The cancel intent persists, then clearing the canceled bot id blows up mid-meeting.
    class CancelCleanupFailureFakeCoreApiClient extends FakeCoreApiClient {
      override async mutation(mutation: any): Promise<any> {
        if (
          mutation.updateCallRecording !== undefined &&
          mutation.updateCallRecording.__args.data.externalBotId === null
        ) {
          throw new Error('recall exploded');
        }

        return super.mutation(mutation);
      }
    }

    const client = new CancelCleanupFailureFakeCoreApiClient({
      calendarEvents: [
        buildCalendarEvent({
          callRecorderPreference: 'OFF',
        }),
        buildCalendarEvent({
          id: 'calendar-event-2',
          iCalUid: 'other-meeting-uid',
          conferenceLink: {
            primaryLinkUrl: 'https://meet.google.com/other-sync',
          },
        }),
      ],
      callRecordings: [
        {
          id: 'call-recording-1',
          title: 'Customer Sync',
          status: 'SCHEDULED',
          recordingRequestStatus: 'REQUESTED',
          startedAt: FUTURE_STARTS_AT,
          endedAt: FUTURE_ENDS_AT,
          calendarEventId: 'calendar-event-1',
          externalBotId: 'recall-bot-1',
        },
      ],
    });

    const result = await reconcileCallRecorderForCalendarEventIds({
      client: client as unknown as CoreApiClient,
      calendarEventIds: ['calendar-event-1', 'calendar-event-2'],
      now: NOW,
    });

    expect(result).toEqual([
      expect.objectContaining({
        action: 'FAILED',
        realMeetingKey: `link:meet.google.com/customer-sync:${FUTURE_STARTS_AT}`,
        errorMessage: 'recall exploded',
      }),
      expect.objectContaining({ action: 'CREATED' }),
    ]);
    expect(client.callRecordings).toEqual([
      expect.objectContaining({
        id: 'call-recording-1',
        recordingRequestStatus: 'CANCELED',
        externalBotId: 'recall-bot-1',
      }),
      expect.objectContaining({
        calendarEventId: 'calendar-event-2',
        status: 'SCHEDULED',
      }),
    ]);
  });

  it('cancels the scheduled request when the conference link is removed', async () => {
    const client = buildFakeCoreApiClient({
      calendarEvents: [
        buildCalendarEvent({
          conferenceLink: null,
        }),
      ],
      callRecordings: [
        {
          id: 'call-recording-1',
          title: 'Customer Sync',
          status: 'SCHEDULED',
          recordingRequestStatus: 'REQUESTED',
          startedAt: FUTURE_STARTS_AT,
          endedAt: FUTURE_ENDS_AT,
          calendarEventId: 'calendar-event-1',
          externalBotId: 'recall-bot-1',
        },
      ],
    });

    const result = await reconcileCallRecorderForCalendarEventIds({
      client: client as unknown as CoreApiClient,
      calendarEventIds: ['calendar-event-1'],
      now: NOW,
    });

    expect(result).toEqual([
      expect.objectContaining({
        action: 'CANCELED',
        callRecordingId: 'call-recording-1',
      }),
    ]);
    expect(client.callRecordings).toEqual([
      expect.objectContaining({
        id: 'call-recording-1',
        recordingRequestStatus: 'CANCELED',
        externalBotId: null,
      }),
    ]);
  });

  it('clears the stale bot id for the stale-state cron to re-create when the existing Recall bot no longer exists', async () => {
    fetchMock.mockImplementation(
      async (requestUrl: string, requestInit: RequestInit) => {
        if (requestInit.method === 'PATCH') {
          return new Response(JSON.stringify({ detail: 'Not found.' }), {
            status: 404,
          });
        }

        throw new Error(`Unhandled fetch: ${requestInit.method} ${requestUrl}`);
      },
    );

    const client = buildFakeCoreApiClient({
      calendarEvents: [buildCalendarEvent()],
      callRecordings: [
        {
          id: buildCustomerSyncCallRecordingId(),
          title: 'Customer Sync',
          status: 'SCHEDULED',
          recordingRequestStatus: 'REQUESTED',
          startedAt: FUTURE_STARTS_AT,
          endedAt: FUTURE_ENDS_AT,
          calendarEventId: 'calendar-event-1',
          externalBotId: 'recall-bot-stale',
        },
      ],
    });

    const result = await reconcileCallRecorderForCalendarEventIds({
      client: client as unknown as CoreApiClient,
      calendarEventIds: ['calendar-event-1'],
      now: NOW,
    });

    expect(result).toEqual([
      expect.objectContaining({
        action: 'UPDATED',
        callRecordingId: buildCustomerSyncCallRecordingId(),
      }),
    ]);
    expect(recallBotUpdateCalls().map(([requestUrl]) => requestUrl)).toEqual([
      `${RECALL_API_BASE_URL}/bot/recall-bot-stale/`,
    ]);
    // The event path no longer re-creates the bot; the stale id is cleared and the cron schedules a bot for the pending row.
    expect(recallBotCreateCalls()).toHaveLength(0);
    expect(client.callRecordings).toEqual([
      expect.objectContaining({
        id: buildCustomerSyncCallRecordingId(),
        externalBotId: null,
      }),
    ]);
  });

  it('adopts the concurrently created recording when it loses the deterministic-id insert race', async () => {
    class InsertRaceFakeCoreApiClient extends FakeCoreApiClient {
      override async mutation(mutation: any): Promise<any> {
        if (mutation.createCallRecording !== undefined) {
          const concurrentlyInsertedId =
            mutation.createCallRecording.__args.data.id;

          if (
            !this.callRecordings.some(
              (candidate) => candidate.id === concurrentlyInsertedId,
            )
          ) {
            this.callRecordings.push({
              id: concurrentlyInsertedId,
              status: 'SCHEDULED',
              recordingRequestStatus: 'REQUESTED',
              calendarEventId: 'calendar-event-1',
              externalBotId: 'sibling-bot',
            });
          }
        }

        return super.mutation(mutation);
      }
    }

    const client = new InsertRaceFakeCoreApiClient({
      calendarEvents: [buildCalendarEvent()],
    });

    const result = await reconcileCallRecorderForCalendarEventIds({
      client: client as unknown as CoreApiClient,
      calendarEventIds: ['calendar-event-1'],
      now: NOW,
    });

    expect(result).toEqual([
      expect.objectContaining({
        action: 'UPDATED',
        callRecordingId: buildCustomerSyncCallRecordingId(),
      }),
    ]);
    expect(client.callRecordings).toHaveLength(1);
    expect(recallBotCreateCalls()).toHaveLength(0);
    expect(recallBotUpdateCalls().map(([requestUrl]) => requestUrl)).toEqual([
      `${RECALL_API_BASE_URL}/bot/sibling-bot/`,
    ]);
  });

  it('fails the meeting when the create conflicts without a readable recording', async () => {
    class TombstoneFakeCoreApiClient extends FakeCoreApiClient {
      override async mutation(mutation: any): Promise<any> {
        if (mutation.createCallRecording !== undefined) {
          throw new Error('Duplicate id on a soft-deleted record');
        }

        return super.mutation(mutation);
      }
    }

    const client = new TombstoneFakeCoreApiClient({
      calendarEvents: [buildCalendarEvent()],
    });

    const result = await reconcileCallRecorderForCalendarEventIds({
      client: client as unknown as CoreApiClient,
      calendarEventIds: ['calendar-event-1'],
      now: NOW,
    });

    expect(result).toEqual([
      expect.objectContaining({
        action: 'FAILED',
        errorMessage: 'Duplicate id on a soft-deleted record',
      }),
    ]);
    expect(recallBotCreateCalls()).toHaveLength(0);
  });

  it('schedules exactly one bot when concurrent reconciles race for the same meeting', async () => {
    const client = buildFakeCoreApiClient({
      calendarEvents: [buildCalendarEvent()],
    });

    await Promise.all(
      Array.from({ length: 4 }, () =>
        reconcileCallRecorderForCalendarEventIds({
          client: client as unknown as CoreApiClient,
          calendarEventIds: ['calendar-event-1'],
          now: NOW,
        }),
      ),
    );

    expect(client.callRecordings).toHaveLength(1);
    expect(recallBotCreateCalls()).toHaveLength(1);
    expect(client.callRecordings[0].externalBotId).toBe('recall-bot-1');
  });

  it('does not schedule a bot when the recording is canceled between decide and schedule', async () => {
    class CancelRaceFakeCoreApiClient extends FakeCoreApiClient {
      override async query(query: any): Promise<any> {
        if (query.callRecordings?.__args.filter.id?.in !== undefined) {
          const callRecording = this.callRecordings.find((candidate) =>
            query.callRecordings.__args.filter.id.in.includes(candidate.id),
          );

          if (callRecording !== undefined) {
            callRecording.recordingRequestStatus = 'CANCELED';
          }
        }

        return super.query(query);
      }
    }

    const client = new CancelRaceFakeCoreApiClient({
      calendarEvents: [buildCalendarEvent()],
    });

    const result = await reconcileCallRecorderForCalendarEventIds({
      client: client as unknown as CoreApiClient,
      calendarEventIds: ['calendar-event-1'],
      now: NOW,
    });

    expect(result).toEqual([expect.objectContaining({ action: 'CREATED' })]);
    expect(recallBotCreateCalls()).toHaveLength(0);
  });
});
