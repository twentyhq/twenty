import { type CoreApiClient } from 'twenty-client-sdk/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { computeRecallBotJoinAt } from 'src/logic-functions/domain/compute-recall-bot-join-at.util';
import { scheduleRecallBotsForPendingCallRecordings } from 'src/logic-functions/flows/schedule-recall-bots-for-pending-call-recordings.util';
import { scheduleRecallBotForCallRecording } from 'src/logic-functions/flows/schedule-recall-bot-for-call-recording.util';
import { computeRecallBotCreationIdempotencyKey } from 'src/logic-functions/recall-api/schedule-recall-bot.util';

const NOW = new Date('2026-01-01T12:00:00.000Z');
const WORKSPACE_ID = '123e4567-e89b-12d3-a456-426614174000';
const UPCOMING_STARTS_AT = '2026-01-01T13:00:00.000Z';
const UPCOMING_ENDS_AT = '2026-01-01T14:00:00.000Z';
const PAST_STARTS_AT = '2026-01-01T10:00:00.000Z';
const PAST_ENDS_AT = '2026-01-01T11:00:00.000Z';
const RECALL_BASE_URL = 'https://us-west-2.recall.ai/api/v1';
const RECALL_CREATE_BOT_URL = `${RECALL_BASE_URL}/bot/`;
const RECALL_LIST_BOTS_URL_PREFIX = `${RECALL_BASE_URL}/bot/?`;

const buildAccessToken = (payload: Record<string, unknown>): string =>
  [
    Buffer.from(JSON.stringify({ alg: 'none' })).toString('base64url'),
    Buffer.from(JSON.stringify(payload)).toString('base64url'),
    'signature',
  ].join('.');

const fetchMock = vi.fn();

type CallRecordingNode = {
  id: string;
  deletedAt?: string | null;
  status?: string;
  recordingRequestStatus?: string | null;
  calendarEventId?: string | null;
  externalBotId?: string | null;
  botScheduleAttemptId?: string | null;
  botScheduleAttemptedAt?: string | null;
  botScheduleIdempotencyKey?: string | null;
  callRecorderFailureReason?: string | null;
};

type CalendarEventNode = {
  id: string;
  startsAt?: string | null;
  endsAt?: string | null;
  iCalUid?: string | null;
  conferenceLink?: { primaryLinkUrl?: string | null } | null;
};

class FakeCoreApiClient {
  callRecordings: CallRecordingNode[];
  calendarEvents: CalendarEventNode[];
  softDeleteCallRecordingAfterNextIdLookup: boolean;
  softDeleteCallRecordingAfterNextAttemptClaim: boolean;
  attachExternalBotAfterNextAttemptClaim: boolean;

  constructor({
    callRecordings = [],
    calendarEvents = [],
    softDeleteCallRecordingAfterNextIdLookup = false,
    softDeleteCallRecordingAfterNextAttemptClaim = false,
    attachExternalBotAfterNextAttemptClaim = false,
  }: {
    callRecordings?: CallRecordingNode[];
    calendarEvents?: CalendarEventNode[];
    softDeleteCallRecordingAfterNextIdLookup?: boolean;
    softDeleteCallRecordingAfterNextAttemptClaim?: boolean;
    attachExternalBotAfterNextAttemptClaim?: boolean;
  }) {
    this.callRecordings = callRecordings;
    this.calendarEvents = calendarEvents;
    this.softDeleteCallRecordingAfterNextIdLookup =
      softDeleteCallRecordingAfterNextIdLookup;
    this.softDeleteCallRecordingAfterNextAttemptClaim =
      softDeleteCallRecordingAfterNextAttemptClaim;
    this.attachExternalBotAfterNextAttemptClaim =
      attachExternalBotAfterNextAttemptClaim;
  }

  async query(query: any): Promise<any> {
    if (query.callRecordings !== undefined) {
      const filter = query.callRecordings.__args.filter;
      const matches =
        filter.id?.in !== undefined
          ? this.callRecordings.filter((callRecording) =>
              filter.id.in.includes(callRecording.id),
            )
          : this.callRecordings.filter(
              (callRecording) =>
                callRecording.recordingRequestStatus ===
                  filter.recordingRequestStatus.eq &&
                callRecording.status === filter.status.eq,
            );

      const callRecordingsConnection = buildConnection(matches);

      if (
        filter.id?.in !== undefined &&
        this.softDeleteCallRecordingAfterNextIdLookup
      ) {
        this.softDeleteCallRecordingAfterNextIdLookup = false;
        this.callRecordings
          .filter((callRecording) =>
            filter.id.in.includes(callRecording.id),
          )
          .forEach((callRecording) => {
            callRecording.deletedAt = NOW.toISOString();
          });
      }

      return { callRecordings: callRecordingsConnection };
    }

    if (query.calendarEvents !== undefined) {
      const calendarEventIds = query.calendarEvents.__args.filter.id.in;

      return {
        calendarEvents: buildConnection(
          this.calendarEvents.filter((calendarEvent) =>
            calendarEventIds.includes(calendarEvent.id),
          ),
        ),
      };
    }

    throw new Error(`Unhandled query: ${JSON.stringify(query)}`);
  }

  async mutation(mutation: any): Promise<any> {
    if (mutation.updateCallRecordings !== undefined) {
      const { filter, data } = mutation.updateCallRecordings.__args;
      const matchingCallRecordings = this.callRecordings.filter(
        (callRecording) =>
          matchesCallRecordingMutationFilter(callRecording, filter),
      );

      matchingCallRecordings.forEach((callRecording) => {
        Object.assign(callRecording, data);
      });

      if (
        this.softDeleteCallRecordingAfterNextAttemptClaim &&
        typeof data.botScheduleAttemptId === 'string'
      ) {
        this.softDeleteCallRecordingAfterNextAttemptClaim = false;
        matchingCallRecordings.forEach((callRecording) => {
          callRecording.deletedAt = NOW.toISOString();
        });
      }

      if (
        this.attachExternalBotAfterNextAttemptClaim &&
        typeof data.botScheduleAttemptId === 'string'
      ) {
        this.attachExternalBotAfterNextAttemptClaim = false;
        matchingCallRecordings.forEach((callRecording) => {
          callRecording.status = 'JOINING';
          callRecording.externalBotId = 'recall-bot-1';
        });
      }

      return {
        updateCallRecordings: matchingCallRecordings.map(({ id }) => ({ id })),
      };
    }

    if (mutation.updateCallRecording !== undefined) {
      const { id, data } = mutation.updateCallRecording.__args;
      const callRecording = this.callRecordings.find(
        (candidate) => candidate.id === id,
      );

      if (callRecording !== undefined) {
        Object.assign(callRecording, data);
      }

      return { updateCallRecording: { id } };
    }

    throw new Error(`Unhandled mutation: ${JSON.stringify(mutation)}`);
  }
}

const matchesCallRecordingMutationFilter = (
  callRecording: CallRecordingNode,
  callRecordingMutationFilter: Record<
    string,
    { eq?: unknown; in?: unknown[]; is?: 'NULL' | 'NOT_NULL' }
  >,
): boolean =>
  Object.entries(callRecordingMutationFilter).every(
    ([fieldName, fieldFilter]) => {
      const callRecordingFieldValue = (
        callRecording as Record<string, unknown>
      )[fieldName];

      if (
        fieldFilter.eq !== undefined &&
        callRecordingFieldValue !== fieldFilter.eq
      ) {
        return false;
      }

      if (
        fieldFilter.in !== undefined &&
        !fieldFilter.in.includes(callRecordingFieldValue)
      ) {
        return false;
      }

      if (fieldFilter.is === 'NULL' && callRecordingFieldValue != null) {
        return false;
      }

      if (fieldFilter.is === 'NOT_NULL' && callRecordingFieldValue == null) {
        return false;
      }

      return true;
    },
  );

const buildConnection = <Node>(nodes: Node[]) => ({
  pageInfo: { hasNextPage: false, endCursor: undefined },
  edges: nodes.map((node) => ({ node })),
});

const buildPendingCallRecording = (
  overrides: Partial<CallRecordingNode> = {},
): CallRecordingNode => ({
  id: 'call-recording-1',
  status: 'SCHEDULED',
  recordingRequestStatus: 'REQUESTED',
  calendarEventId: 'calendar-event-1',
  externalBotId: null,
  ...overrides,
});

const buildCalendarEvent = (
  overrides: Partial<CalendarEventNode> = {},
): CalendarEventNode => ({
  id: 'calendar-event-1',
  startsAt: UPCOMING_STARTS_AT,
  endsAt: UPCOMING_ENDS_AT,
  iCalUid: 'calendar-event-uid',
  conferenceLink: { primaryLinkUrl: 'https://meet.example.com/customer-sync' },
  ...overrides,
});

const stubRecallApi = ({
  listedBots = [],
  listStatus = 200,
  createBotStatus = 201,
}: {
  listedBots?: unknown[];
  listStatus?: number;
  createBotStatus?: number;
} = {}) => {
  fetchMock.mockImplementation(
    async (requestUrl: string, requestInit?: { method?: string }) => {
      const method = requestInit?.method ?? 'GET';

      if (
        method === 'GET' &&
        requestUrl.startsWith(RECALL_LIST_BOTS_URL_PREFIX)
      ) {
        return new Response(
          JSON.stringify({ next: null, results: listedBots }),
          { status: listStatus },
        );
      }

      if (method === 'POST' && requestUrl === RECALL_CREATE_BOT_URL) {
        return new Response(JSON.stringify({ id: 'recall-bot-1' }), {
          status: createBotStatus,
        });
      }

      if (method === 'DELETE' && requestUrl.includes('/bot/')) {
        return new Response(undefined, { status: 204 });
      }

      throw new Error(`Unhandled fetch in test: ${method} ${requestUrl}`);
    },
  );
};

const listBotRequestUrls = (): string[] =>
  fetchMock.mock.calls
    .filter(
      ([requestUrl, requestInit]) =>
        (requestInit?.method ?? 'GET') === 'GET' &&
        requestUrl.startsWith(RECALL_LIST_BOTS_URL_PREFIX),
    )
    .map(([requestUrl]) => requestUrl);

const createBotCalls = () =>
  fetchMock.mock.calls.filter(
    ([, requestInit]) => requestInit?.method === 'POST',
  );

const deleteBotCalls = () =>
  fetchMock.mock.calls.filter(
    ([, requestInit]) => requestInit?.method === 'DELETE',
  );

describe('scheduleRecallBotsForPendingCallRecordings', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('RECALL_API_KEY', 'recall-api-key');
    vi.stubEnv('RECALL_REGION', 'us-west-2');
    vi.stubEnv('CALL_RECORDER_USE_WORKSPACE_LOGO', 'false');
    vi.stubEnv(
      'TWENTY_APP_ACCESS_TOKEN',
      buildAccessToken({ workspaceId: WORKSPACE_ID }),
    );
    fetchMock.mockReset();
    stubRecallApi();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('schedules a bot and writes the id for an upcoming pending recording', async () => {
    const client = new FakeCoreApiClient({
      callRecordings: [buildPendingCallRecording()],
      calendarEvents: [buildCalendarEvent()],
    });

    const result = await scheduleRecallBotsForPendingCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(result.scheduledCallRecordingIds).toEqual(['call-recording-1']);
    expect(result.attachedCallRecordingIds).toEqual([]);
    // A row that never attempted a bot creation needs no Recall lookup.
    expect(listBotRequestUrls()).toHaveLength(0);
    expect(client.callRecordings[0].botScheduleAttemptedAt).toBe(
      NOW.toISOString(),
    );
    expect(createBotCalls()).toHaveLength(1);
    const [requestUrl, requestInit] = createBotCalls()[0];
    expect(requestUrl).toBe(RECALL_CREATE_BOT_URL);
    expect(requestInit.headers).toMatchObject({
      Authorization: 'Token recall-api-key',
    });
    expect(JSON.parse(requestInit.body)).toMatchObject({
      meeting_url: 'https://meet.example.com/customer-sync',
      join_at: '2026-01-01T12:59:00.000Z',
      metadata: {
        twentyWorkspaceId: WORKSPACE_ID,
        twentyCallRecordingId: 'call-recording-1',
        twentyBotScheduleAttemptId: expect.stringMatching(
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
        ),
      },
    });
    expect(client.callRecordings[0].externalBotId).toBe('recall-bot-1');
  });

  it('does not create a bot when the recording is deleted after the eligibility read', async () => {
    const client = new FakeCoreApiClient({
      callRecordings: [buildPendingCallRecording()],
      calendarEvents: [buildCalendarEvent()],
      softDeleteCallRecordingAfterNextIdLookup: true,
    });

    const schedulingResult = await scheduleRecallBotsForPendingCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(schedulingResult.scheduledCallRecordingIds).toEqual([]);
    expect(createBotCalls()).toHaveLength(0);
    expect(client.callRecordings[0].deletedAt).toBe(NOW.toISOString());
  });

  it('removes a bot whose recording was deleted after the attempt claim', async () => {
    const client = new FakeCoreApiClient({
      callRecordings: [buildPendingCallRecording()],
      calendarEvents: [buildCalendarEvent()],
      softDeleteCallRecordingAfterNextAttemptClaim: true,
    });

    const schedulingResult = await scheduleRecallBotsForPendingCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(schedulingResult.scheduledCallRecordingIds).toEqual([]);
    expect(createBotCalls()).toHaveLength(1);
    expect(deleteBotCalls()).toHaveLength(1);
    expect(client.callRecordings[0].externalBotId).toBeNull();
    expect(client.callRecordings[0].deletedAt).toBe(NOW.toISOString());
  });

  it('allows only one concurrent scheduler to claim a new attempt', async () => {
    const callRecording = buildPendingCallRecording();
    const client = new FakeCoreApiClient({
      callRecordings: [callRecording],
      calendarEvents: [buildCalendarEvent()],
    });
    const meetingRecording = {
      callRecording: {
        id: callRecording.id,
      },
      calendarEvent: {
        id: 'calendar-event-1',
        title: 'Customer Sync',
        isCanceled: false,
        startsAt: UPCOMING_STARTS_AT,
        endsAt: UPCOMING_ENDS_AT,
        iCalUid: 'calendar-event-uid',
        conferenceLinkUrl: 'https://meet.example.com/customer-sync',
        callRecorderPreference: 'ON',
      },
    };

    const schedulingResults = await Promise.all([
      scheduleRecallBotForCallRecording(
        client as unknown as CoreApiClient,
        meetingRecording,
      ),
      scheduleRecallBotForCallRecording(
        client as unknown as CoreApiClient,
        meetingRecording,
      ),
    ]);

    expect(schedulingResults.filter(Boolean)).toHaveLength(1);
    expect(createBotCalls()).toHaveLength(1);
  });

  it('accepts the same bot when its webhook wins the id write-back race', async () => {
    const client = new FakeCoreApiClient({
      callRecordings: [buildPendingCallRecording()],
      calendarEvents: [buildCalendarEvent()],
      attachExternalBotAfterNextAttemptClaim: true,
    });

    const schedulingResult = await scheduleRecallBotsForPendingCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(schedulingResult.scheduledCallRecordingIds).toEqual([
      'call-recording-1',
    ]);
    expect(createBotCalls()).toHaveLength(1);
    expect(deleteBotCalls()).toHaveLength(0);
    expect(client.callRecordings[0]).toEqual(
      expect.objectContaining({
        status: 'JOINING',
        externalBotId: 'recall-bot-1',
      }),
    );
  });

  it('attaches an existing bot claiming the recording instead of scheduling a duplicate', async () => {
    stubRecallApi({
      listedBots: [
        {
          id: 'recall-bot-existing',
          metadata: {
            twentyWorkspaceId: WORKSPACE_ID,
            twentyCallRecordingId: 'call-recording-1',
          },
        },
      ],
    });
    const client = new FakeCoreApiClient({
      callRecordings: [
        buildPendingCallRecording({
          botScheduleAttemptedAt: '2026-01-01T11:55:00.000Z',
        }),
      ],
      calendarEvents: [buildCalendarEvent()],
    });

    const result = await scheduleRecallBotsForPendingCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(result.attachedCallRecordingIds).toEqual(['call-recording-1']);
    expect(result.scheduledCallRecordingIds).toEqual([]);
    expect(createBotCalls()).toHaveLength(0);
    const lookupParameters = new URL(listBotRequestUrls()[0]).searchParams;
    expect(lookupParameters.get('metadata__twentyWorkspaceId')).toBe(
      WORKSPACE_ID,
    );
    expect(lookupParameters.has('metadata__twentyCallRecordingId')).toBe(
      false,
    );
    expect(lookupParameters.has('join_at_after')).toBe(false);
    expect(lookupParameters.has('join_at_before')).toBe(false);
    expect(lookupParameters.getAll('status')).toEqual([
      'ready',
      'joining_call',
      'in_waiting_room',
      'in_call_not_recording',
      'recording_permission_allowed',
      'recording_permission_denied',
      'in_call_recording',
    ]);
    expect(client.callRecordings[0].externalBotId).toBe('recall-bot-existing');
  });

  it('looks up existing bots once for the whole run instead of per recording', async () => {
    stubRecallApi({
      listedBots: [
        {
          id: 'recall-bot-existing',
          metadata: {
            twentyWorkspaceId: WORKSPACE_ID,
            twentyCallRecordingId: 'call-recording-1',
          },
        },
      ],
    });
    const client = new FakeCoreApiClient({
      callRecordings: [
        buildPendingCallRecording({
          botScheduleAttemptedAt: '2026-01-01T11:55:00.000Z',
        }),
        buildPendingCallRecording({
          id: 'call-recording-2',
          calendarEventId: 'calendar-event-2',
          botScheduleAttemptedAt: '2026-01-01T11:55:00.000Z',
        }),
      ],
      calendarEvents: [
        buildCalendarEvent(),
        buildCalendarEvent({ id: 'calendar-event-2' }),
      ],
    });

    const result = await scheduleRecallBotsForPendingCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(listBotRequestUrls()).toHaveLength(1);
    expect(result.attachedCallRecordingIds).toEqual(['call-recording-1']);
    expect(result.scheduledCallRecordingIds).toEqual(['call-recording-2']);
    expect(createBotCalls()).toHaveLength(1);
  });

  it('defers scheduling when the existing-bot lookup fails so no duplicate bot is created', async () => {
    stubRecallApi({ listStatus: 400 });
    const client = new FakeCoreApiClient({
      callRecordings: [
        buildPendingCallRecording({
          botScheduleAttemptedAt: '2026-01-01T11:55:00.000Z',
        }),
      ],
      calendarEvents: [buildCalendarEvent()],
    });

    const result = await scheduleRecallBotsForPendingCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(result.attachedCallRecordingIds).toEqual([]);
    expect(result.scheduledCallRecordingIds).toEqual([]);
    expect(createBotCalls()).toHaveLength(0);
    expect(client.callRecordings[0].externalBotId).toBeNull();
  });

  it('re-sends the creation without any Recall lookup when the stored idempotency key still matches', async () => {
    const botScheduleAttemptId = '9d1a3e8d-d1de-4c89-9831-67d3219f3270';
    const unchangedIdempotencyKey = computeRecallBotCreationIdempotencyKey({
      meetingUrl: 'https://meet.example.com/customer-sync',
      joinAt: computeRecallBotJoinAt(UPCOMING_STARTS_AT),
      metadata: {
        twentyWorkspaceId: WORKSPACE_ID,
        twentyCallRecordingId: 'call-recording-1',
        twentyBotScheduleAttemptId: botScheduleAttemptId,
      },
    });
    const client = new FakeCoreApiClient({
      callRecordings: [
        buildPendingCallRecording({
          botScheduleAttemptId,
          botScheduleAttemptedAt: '2026-01-01T11:55:00.000Z',
          botScheduleIdempotencyKey: unchangedIdempotencyKey,
        }),
      ],
      calendarEvents: [buildCalendarEvent()],
    });

    const result = await scheduleRecallBotsForPendingCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(listBotRequestUrls()).toHaveLength(0);
    expect(result.scheduledCallRecordingIds).toEqual(['call-recording-1']);
    const [, requestInit] = createBotCalls()[0];
    expect(requestInit.headers).toMatchObject({
      'Idempotency-Key': unchangedIdempotencyKey,
    });
    expect(client.callRecordings[0].externalBotId).toBe('recall-bot-1');
    // The first attempt timestamp survives the re-send so repeated unknown
    // outcomes age out of the resend window.
    expect(client.callRecordings[0].botScheduleAttemptedAt).toBe(
      '2026-01-01T11:55:00.000Z',
    );
  });

  it('falls back to the Recall lookup outside the safe one-hour idempotency window', async () => {
    const botScheduleAttemptId = 'db57a092-c84a-4cd7-8447-8854e7992bff';
    const unchangedIdempotencyKey = computeRecallBotCreationIdempotencyKey({
      meetingUrl: 'https://meet.example.com/customer-sync',
      joinAt: computeRecallBotJoinAt(UPCOMING_STARTS_AT),
      metadata: {
        twentyWorkspaceId: WORKSPACE_ID,
        twentyCallRecordingId: 'call-recording-1',
        twentyBotScheduleAttemptId: botScheduleAttemptId,
      },
    });
    const client = new FakeCoreApiClient({
      callRecordings: [
        buildPendingCallRecording({
          botScheduleAttemptId,
          botScheduleAttemptedAt: '2026-01-01T11:04:00.000Z',
          botScheduleIdempotencyKey: unchangedIdempotencyKey,
        }),
      ],
      calendarEvents: [buildCalendarEvent()],
    });

    const result = await scheduleRecallBotsForPendingCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(listBotRequestUrls()).toHaveLength(1);
    expect(result.scheduledCallRecordingIds).toEqual(['call-recording-1']);
  });

  it('falls back to the Recall lookup when the meeting moved since the recorded attempt', async () => {
    const botScheduleAttemptId = '023fdaea-d57a-48bd-907c-78d00eb06e40';
    const staleIdempotencyKey = computeRecallBotCreationIdempotencyKey({
      meetingUrl: 'https://meet.example.com/customer-sync',
      joinAt: computeRecallBotJoinAt('2026-01-01T09:00:00.000Z'),
      metadata: {
        twentyWorkspaceId: WORKSPACE_ID,
        twentyCallRecordingId: 'call-recording-1',
        twentyBotScheduleAttemptId: botScheduleAttemptId,
      },
    });
    const client = new FakeCoreApiClient({
      callRecordings: [
        buildPendingCallRecording({
          botScheduleAttemptId,
          botScheduleAttemptedAt: '2026-01-01T11:55:00.000Z',
          botScheduleIdempotencyKey: staleIdempotencyKey,
        }),
      ],
      calendarEvents: [buildCalendarEvent()],
    });

    const result = await scheduleRecallBotsForPendingCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(listBotRequestUrls()).toHaveLength(1);
    expect(result.scheduledCallRecordingIds).toEqual(['call-recording-1']);
  });

  it('re-schedules an ambiguous recording when the lookup confirms no bot exists', async () => {
    const client = new FakeCoreApiClient({
      callRecordings: [
        buildPendingCallRecording({
          botScheduleAttemptedAt: '2026-01-01T11:55:00.000Z',
        }),
      ],
      calendarEvents: [buildCalendarEvent()],
    });

    const result = await scheduleRecallBotsForPendingCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(listBotRequestUrls()).toHaveLength(1);
    expect(result.scheduledCallRecordingIds).toEqual(['call-recording-1']);
    expect(createBotCalls()).toHaveLength(1);
    expect(client.callRecordings[0].externalBotId).toBe('recall-bot-1');
  });

  it('does not report a recording as scheduled when Recall scheduling fails', async () => {
    stubRecallApi({ createBotStatus: 500 });
    const client = new FakeCoreApiClient({
      callRecordings: [buildPendingCallRecording()],
      calendarEvents: [buildCalendarEvent()],
    });

    vi.useFakeTimers();
    const resultPromise = scheduleRecallBotsForPendingCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });
    await vi.runAllTimersAsync();
    const result = await resultPromise;

    expect(result.scheduledCallRecordingIds).toEqual([]);
    // One scheduling attempt, retried to exhaustion on the wire.
    expect(createBotCalls()).toHaveLength(3);
    expect(client.callRecordings[0].externalBotId).toBeNull();
  });

  it('marks a recording failed when its meeting ended before any bot was scheduled', async () => {
    const client = new FakeCoreApiClient({
      callRecordings: [buildPendingCallRecording()],
      calendarEvents: [
        buildCalendarEvent({
          startsAt: PAST_STARTS_AT,
          endsAt: PAST_ENDS_AT,
        }),
      ],
    });

    const result = await scheduleRecallBotsForPendingCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(result.scheduledCallRecordingIds).toEqual([]);
    expect(result.markedFailedCallRecordingIds).toEqual(['call-recording-1']);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(client.callRecordings[0].status).toBe('FAILED');
    expect(client.callRecordings[0].callRecorderFailureReason).toBe(
      'bot_never_scheduled',
    );
  });

  it('keeps an ended recording with an unresolved attempt pending while convergence may still resolve it', async () => {
    const client = new FakeCoreApiClient({
      callRecordings: [
        buildPendingCallRecording({
          botScheduleAttemptedAt: '2026-01-01T09:55:00.000Z',
        }),
      ],
      calendarEvents: [
        buildCalendarEvent({
          startsAt: PAST_STARTS_AT,
          endsAt: PAST_ENDS_AT,
        }),
      ],
    });

    const result = await scheduleRecallBotsForPendingCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(result.markedFailedCallRecordingIds).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(client.callRecordings[0].status).toBe('SCHEDULED');
  });

  it('fails an ended recording with an unresolved attempt once the convergence lookback has passed', async () => {
    const client = new FakeCoreApiClient({
      callRecordings: [
        buildPendingCallRecording({
          botScheduleAttemptedAt: '2025-12-20T09:55:00.000Z',
        }),
      ],
      calendarEvents: [
        buildCalendarEvent({
          startsAt: '2025-12-20T10:00:00.000Z',
          endsAt: '2025-12-20T11:00:00.000Z',
        }),
      ],
    });

    const result = await scheduleRecallBotsForPendingCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(result.markedFailedCallRecordingIds).toEqual(['call-recording-1']);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(client.callRecordings[0].status).toBe('FAILED');
    expect(client.callRecordings[0].callRecorderFailureReason).toBe(
      'bot_schedule_outcome_unknown',
    );
  });

  it('leaves a recording untouched when its calendar event is missing', async () => {
    const client = new FakeCoreApiClient({
      callRecordings: [buildPendingCallRecording()],
      calendarEvents: [],
    });

    const result = await scheduleRecallBotsForPendingCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(result.markedFailedCallRecordingIds).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(client.callRecordings[0].status).toBe('SCHEDULED');
  });

  it('does nothing when every scheduled recording already has a bot', async () => {
    const client = new FakeCoreApiClient({
      callRecordings: [
        buildPendingCallRecording({ externalBotId: 'recall-bot-existing' }),
      ],
      calendarEvents: [buildCalendarEvent()],
    });

    const result = await scheduleRecallBotsForPendingCallRecordings({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(result.scheduledCallRecordingIds).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
