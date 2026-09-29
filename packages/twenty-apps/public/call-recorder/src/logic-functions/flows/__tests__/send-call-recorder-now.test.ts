import { type CoreApiClient } from 'twenty-client-sdk/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { computeCallRecordingIdForMeeting } from 'src/logic-functions/domain/compute-call-recording-id-for-meeting.util';
import { sendCallRecorderNow } from 'src/logic-functions/flows/send-call-recorder-now.util';

const getCreditAvailabilityMock = vi.hoisted(() => vi.fn());
const enqueueJobsMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-sdk/billing', () => ({
  getCreditAvailability: getCreditAvailabilityMock,
}));

vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  enqueueJobs: enqueueJobsMock,
}));

const fetchMock = vi.fn();

const NOW = new Date('2026-01-01T12:00:00.000Z');
// Recall clamps the join time to one second after the request.
const AD_HOC_JOIN_AT = '2026-01-01T12:00:01.000Z';
const WORKSPACE_ID = '123e4567-e89b-12d3-a456-426614174000';
const MEETING_STARTS_AT = '2026-01-01T12:15:00.000Z';
const MEETING_ENDS_AT = '2026-01-01T13:00:00.000Z';
const MEETING_URL = 'https://meet.google.com/customer-sync';
const RECALL_API_BASE_URL = 'https://us-west-2.recall.ai/api/v1';
const SCHEDULED_BOT_ID = 'recall-bot-scheduled';
const AD_HOC_BOT_ID = 'recall-bot-ad-hoc';
const CALL_RECORDING_ID = computeCallRecordingIdForMeeting(
  `link:meet.google.com/customer-sync:${MEETING_STARTS_AT}`,
);

const buildAccessToken = (payload: Record<string, unknown>): string =>
  [
    Buffer.from(JSON.stringify({ alg: 'none' })).toString('base64url'),
    Buffer.from(JSON.stringify(payload)).toString('base64url'),
    'signature',
  ].join('.');

type RecallFetchCall = [
  requestUrl: string,
  requestInit: { method: string; body?: string },
];

const recallFetchCalls = (method: string): RecallFetchCall[] =>
  (fetchMock.mock.calls as RecallFetchCall[]).filter(
    ([, requestInit]) => requestInit.method === method,
  );

type CalendarEventNode = {
  id: string;
  title: string;
  isCanceled: boolean;
  startsAt: string;
  endsAt: string;
  iCalUid: string;
  conferenceLink: { primaryLinkUrl: string };
  callRecorderPreference: string | null;
};

type CallRecordingNode = {
  id: string;
  title?: string;
  status: string;
  recordingRequestStatus: string | null;
  calendarEventId: string;
  externalBotId: string | null;
  botScheduleAttemptedAt: string | null;
  botScheduleIdempotencyKey: string | null;
  callRecorderFailureReason?: string | null;
};

type FilterCondition = { eq?: unknown; in?: unknown[]; is?: 'NULL' };

const matchesFilter = (
  record: Record<string, unknown>,
  filter: Record<string, FilterCondition>,
): boolean =>
  Object.entries(filter).every(([field, condition]) => {
    const value = record[field] ?? null;

    if (condition.is === 'NULL') {
      return value === null || value === '';
    }

    if (condition.in !== undefined) {
      return condition.in.includes(value);
    }

    return value === condition.eq;
  });

const buildConnection = <Node>(nodes: Node[]) => ({
  pageInfo: { hasNextPage: false, endCursor: undefined },
  edges: nodes.map((node) => ({ node })),
});

class FakeCoreApiClient {
  calendarEvents: CalendarEventNode[];
  callRecordings: CallRecordingNode[];
  // Lets a test simulate a concurrent run between two of this run's writes.
  beforeCallRecordingsUpdate: (
    filter: Record<string, FilterCondition>,
  ) => void = () => {};

  constructor({
    calendarEvents,
    callRecordings = [],
  }: {
    calendarEvents: CalendarEventNode[];
    callRecordings?: CallRecordingNode[];
  }) {
    this.calendarEvents = calendarEvents;
    this.callRecordings = callRecordings;
  }

  async query(query: any): Promise<any> {
    if (query.calendarEvents !== undefined) {
      const { filter } = query.calendarEvents.__args;

      return {
        calendarEvents: buildConnection(
          this.calendarEvents.filter((calendarEvent) =>
            filter.id.in.includes(calendarEvent.id),
          ),
        ),
      };
    }

    if (query.callRecordings !== undefined) {
      const { filter } = query.callRecordings.__args;

      return {
        callRecordings: buildConnection(
          this.callRecordings.filter((callRecording) =>
            filter.id.in.includes(callRecording.id),
          ),
        ),
      };
    }

    throw new Error(`Unhandled query: ${JSON.stringify(query)}`);
  }

  async mutation(mutation: any): Promise<any> {
    if (mutation.createCallRecording !== undefined) {
      const { data } = mutation.createCallRecording.__args;

      if (this.callRecordings.some((candidate) => candidate.id === data.id)) {
        throw new Error(`Duplicate call recording id ${data.id}`);
      }

      this.callRecordings.push({
        externalBotId: null,
        botScheduleAttemptedAt: null,
        botScheduleIdempotencyKey: null,
        ...data,
      });

      return { createCallRecording: { id: data.id } };
    }

    if (mutation.updateCallRecordings !== undefined) {
      const { filter, data } = mutation.updateCallRecordings.__args;

      this.beforeCallRecordingsUpdate(filter);

      const matchingCallRecordings = this.callRecordings.filter(
        (callRecording) => matchesFilter(callRecording, filter),
      );

      for (const callRecording of matchingCallRecordings) {
        Object.assign(callRecording, data);
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

      if (callRecording === undefined) {
        throw new Error(`Could not find call recording ${id}`);
      }

      Object.assign(callRecording, data);

      return { updateCallRecording: { id } };
    }

    if (mutation.updateCalendarEvents !== undefined) {
      const { filter, data } = mutation.updateCalendarEvents.__args;
      const matchingCalendarEvents = this.calendarEvents.filter(
        (calendarEvent) => calendarEvent.id === filter.id.eq,
      );

      for (const calendarEvent of matchingCalendarEvents) {
        Object.assign(calendarEvent, data);
      }

      return {
        updateCalendarEvents: matchingCalendarEvents.map(({ id }) => ({ id })),
      };
    }

    throw new Error(`Unhandled mutation: ${JSON.stringify(mutation)}`);
  }
}

const buildCalendarEvent = (
  overrides: Partial<CalendarEventNode> = {},
): CalendarEventNode => ({
  id: 'calendar-event-1',
  title: 'Customer sync',
  isCanceled: false,
  startsAt: MEETING_STARTS_AT,
  endsAt: MEETING_ENDS_AT,
  iCalUid: 'calendar-event-uid',
  conferenceLink: { primaryLinkUrl: MEETING_URL },
  callRecorderPreference: 'ON',
  ...overrides,
});

const buildScheduledCallRecording = (
  overrides: Partial<CallRecordingNode> = {},
): CallRecordingNode => ({
  id: CALL_RECORDING_ID,
  title: 'Customer sync',
  status: 'SCHEDULED',
  recordingRequestStatus: 'REQUESTED',
  calendarEventId: 'calendar-event-1',
  externalBotId: SCHEDULED_BOT_ID,
  botScheduleAttemptedAt: '2025-12-30T12:00:00.000Z',
  botScheduleIdempotencyKey: 'scheduled-attempt-key',
  ...overrides,
});

const stubRecallApi = ({
  deleteStatus = 204,
  createStatus = 201,
}: { deleteStatus?: number; createStatus?: number } = {}) => {
  fetchMock.mockImplementation(
    async (requestUrl: string, requestInit: RequestInit) => {
      if (requestInit.method === 'DELETE') {
        return new Response(deleteStatus === 204 ? null : '{}', {
          status: deleteStatus,
        });
      }

      if (requestInit.method === 'POST') {
        return new Response(
          JSON.stringify(
            createStatus < 400 ? { id: AD_HOC_BOT_ID } : { code: 'failed' },
          ),
          { status: createStatus },
        );
      }

      throw new Error(`Unhandled fetch: ${requestInit.method} ${requestUrl}`);
    },
  );
};

const sendNow = (client: FakeCoreApiClient) =>
  sendCallRecorderNow({
    client: client as unknown as CoreApiClient,
    calendarEventId: 'calendar-event-1',
    now: NOW,
  });

const expectAdHocBotCreated = (client: FakeCoreApiClient) => {
  const createCalls = recallFetchCalls('POST');

  expect(createCalls).toHaveLength(1);
  expect(createCalls[0][0]).toBe(`${RECALL_API_BASE_URL}/bot/`);
  expect(JSON.parse(createCalls[0][1].body ?? '')).toEqual(
    expect.objectContaining({
      meeting_url: MEETING_URL,
      join_at: AD_HOC_JOIN_AT,
      metadata: {
        twentyWorkspaceId: WORKSPACE_ID,
        twentyCallRecordingId: CALL_RECORDING_ID,
      },
    }),
  );
  expect(client.callRecordings).toEqual([
    expect.objectContaining({
      id: CALL_RECORDING_ID,
      status: 'SCHEDULED',
      recordingRequestStatus: 'REQUESTED',
      externalBotId: AD_HOC_BOT_ID,
      botScheduleAttemptedAt: NOW.toISOString(),
    }),
  ]);
};

describe('sendCallRecorderNow', () => {
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
    getCreditAvailabilityMock.mockReset();
    getCreditAvailabilityMock.mockResolvedValue({ hasAvailableCredits: true });
    enqueueJobsMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('replaces the scheduled bot with one joining now', async () => {
    const client = new FakeCoreApiClient({
      calendarEvents: [buildCalendarEvent()],
      callRecordings: [buildScheduledCallRecording()],
    });

    const result = await sendNow(client);

    expect(result).toEqual({
      status: 'sent',
      callRecordingId: CALL_RECORDING_ID,
    });
    expect(
      recallFetchCalls('DELETE').map(([requestUrl]) => requestUrl),
    ).toEqual([`${RECALL_API_BASE_URL}/bot/${SCHEDULED_BOT_ID}/`]);
    expectAdHocBotCreated(client);
    expect(client.callRecordings[0].botScheduleIdempotencyKey).not.toBe(
      'scheduled-attempt-key',
    );
    // A bot joining now gets its credit verdict before creation, never a delayed check.
    expect(getCreditAvailabilityMock).toHaveBeenCalledOnce();
    expect(enqueueJobsMock).not.toHaveBeenCalled();
  });

  it('leaves a bot that Recall already dispatched in the call', async () => {
    stubRecallApi({ deleteStatus: 405 });
    const client = new FakeCoreApiClient({
      calendarEvents: [buildCalendarEvent()],
      callRecordings: [buildScheduledCallRecording()],
    });

    const result = await sendNow(client);

    expect(result).toEqual({
      status: 'already-joined',
      callRecordingId: CALL_RECORDING_ID,
    });
    expect(recallFetchCalls('POST')).toHaveLength(0);
    expect(client.callRecordings[0].externalBotId).toBe(SCHEDULED_BOT_ID);
  });

  it('turns the recording back on and requests a bot joining now for a meeting switched off', async () => {
    const client = new FakeCoreApiClient({
      calendarEvents: [buildCalendarEvent({ callRecorderPreference: 'OFF' })],
      callRecordings: [
        buildScheduledCallRecording({
          recordingRequestStatus: 'CANCELED',
          externalBotId: null,
          botScheduleAttemptedAt: null,
          botScheduleIdempotencyKey: null,
        }),
      ],
    });

    const result = await sendNow(client);

    expect(result).toEqual({
      status: 'sent',
      callRecordingId: CALL_RECORDING_ID,
    });
    expect(client.calendarEvents[0].callRecorderPreference).toBe('ON');
    expect(recallFetchCalls('DELETE')).toHaveLength(0);
    expectAdHocBotCreated(client);
  });

  it('creates the recording and requests a bot joining now for a meeting without one', async () => {
    const client = new FakeCoreApiClient({
      calendarEvents: [buildCalendarEvent({ callRecorderPreference: null })],
    });

    const result = await sendNow(client);

    expect(result).toEqual({
      status: 'sent',
      callRecordingId: CALL_RECORDING_ID,
    });
    expectAdHocBotCreated(client);
    expect(client.callRecordings[0]).toEqual(
      expect.objectContaining({
        title: 'Customer sync',
        calendarEventId: 'calendar-event-1',
      }),
    );
  });

  it('reopens a not-recorded request before sending the bot', async () => {
    const client = new FakeCoreApiClient({
      calendarEvents: [buildCalendarEvent()],
      callRecordings: [
        buildScheduledCallRecording({
          status: 'NOT_RECORDED',
          externalBotId: null,
          botScheduleAttemptedAt: null,
          botScheduleIdempotencyKey: null,
          callRecorderFailureReason: 'workspace_out_of_credits',
        }),
      ],
    });

    const result = await sendNow(client);

    expect(result).toEqual({
      status: 'sent',
      callRecordingId: CALL_RECORDING_ID,
    });
    expectAdHocBotCreated(client);
    expect(client.callRecordings[0].callRecorderFailureReason).toBeNull();
  });

  it('moves the bot a concurrent run scheduled while the request was reopened', async () => {
    const client = new FakeCoreApiClient({
      calendarEvents: [buildCalendarEvent()],
      callRecordings: [
        buildScheduledCallRecording({
          recordingRequestStatus: 'CANCELED',
          externalBotId: null,
          botScheduleAttemptedAt: null,
          botScheduleIdempotencyKey: null,
        }),
      ],
    });
    let hasSimulatedConcurrentRun = false;

    // The update trigger's run wins the first creation with the regular join time.
    client.beforeCallRecordingsUpdate = (filter) => {
      if (
        hasSimulatedConcurrentRun ||
        filter.botScheduleAttemptedAt?.is !== 'NULL'
      ) {
        return;
      }

      hasSimulatedConcurrentRun = true;
      Object.assign(client.callRecordings[0], {
        externalBotId: SCHEDULED_BOT_ID,
        botScheduleAttemptedAt: '2026-01-01T11:59:59.000Z',
        botScheduleIdempotencyKey: 'concurrent-attempt-key',
      });
    };

    const result = await sendNow(client);

    expect(result).toEqual({
      status: 'sent',
      callRecordingId: CALL_RECORDING_ID,
    });
    expect(
      recallFetchCalls('DELETE').map(([requestUrl]) => requestUrl),
    ).toEqual([`${RECALL_API_BASE_URL}/bot/${SCHEDULED_BOT_ID}/`]);
    expectAdHocBotCreated(client);
  });

  it('leaves a meeting that has ended alone', async () => {
    const client = new FakeCoreApiClient({
      calendarEvents: [
        buildCalendarEvent({
          startsAt: '2026-01-01T10:00:00.000Z',
          endsAt: '2026-01-01T11:00:00.000Z',
        }),
      ],
      callRecordings: [buildScheduledCallRecording()],
    });

    const result = await sendNow(client);

    expect(result).toEqual({ status: 'skipped', reason: 'EVENT_NOT_UPCOMING' });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(client.callRecordings[0].externalBotId).toBe(SCHEDULED_BOT_ID);
  });

  it('leaves a meeting without a supported video link alone', async () => {
    const client = new FakeCoreApiClient({
      calendarEvents: [
        buildCalendarEvent({
          conferenceLink: { primaryLinkUrl: 'https://ro.am/customer-sync' },
        }),
      ],
    });

    const result = await sendNow(client);

    expect(result).toEqual({
      status: 'skipped',
      reason: 'UNSUPPORTED_MEETING_PLATFORM',
    });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(client.callRecordings).toEqual([]);
  });

  it('leaves a recorder that is already in the call alone', async () => {
    const client = new FakeCoreApiClient({
      calendarEvents: [buildCalendarEvent()],
      callRecordings: [buildScheduledCallRecording({ status: 'RECORDING' })],
    });

    const result = await sendNow(client);

    expect(result).toEqual({
      status: 'already-joined',
      callRecordingId: CALL_RECORDING_ID,
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('reports a meeting that was already recorded', async () => {
    const client = new FakeCoreApiClient({
      calendarEvents: [buildCalendarEvent()],
      callRecordings: [
        buildScheduledCallRecording({
          status: 'COMPLETED',
          externalBotId: null,
        }),
      ],
    });

    const result = await sendNow(client);

    expect(result).toEqual({
      status: 'skipped',
      reason: 'RECORDING_COMPLETED',
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('deletes the scheduled bot but creates none when the workspace is out of credits', async () => {
    getCreditAvailabilityMock.mockResolvedValue({
      hasAvailableCredits: false,
      reason: 'no-credits',
    });
    const client = new FakeCoreApiClient({
      calendarEvents: [buildCalendarEvent()],
      callRecordings: [buildScheduledCallRecording()],
    });

    const result = await sendNow(client);

    expect(result).toEqual({
      status: 'blocked',
      failureReason: 'workspace_out_of_credits',
    });
    expect(recallFetchCalls('DELETE')).toHaveLength(1);
    expect(recallFetchCalls('POST')).toHaveLength(0);
    expect(client.callRecordings[0]).toEqual(
      expect.objectContaining({
        status: 'NOT_RECORDED',
        callRecorderFailureReason: 'workspace_out_of_credits',
        externalBotId: null,
      }),
    );
  });

  it('drops the deleted bot so a regular one is rescheduled when the replacement cannot be created', async () => {
    stubRecallApi({ createStatus: 400 });
    const client = new FakeCoreApiClient({
      calendarEvents: [buildCalendarEvent()],
      callRecordings: [buildScheduledCallRecording()],
    });

    const result = await sendNow(client);

    expect(result).toEqual({
      status: 'failed',
      reason: expect.stringContaining('HTTP 400'),
    });
    expect(client.callRecordings[0]).toEqual(
      expect.objectContaining({
        status: 'SCHEDULED',
        recordingRequestStatus: 'REQUESTED',
        externalBotId: null,
        botScheduleAttemptedAt: null,
        botScheduleIdempotencyKey: null,
      }),
    );
  });
});
