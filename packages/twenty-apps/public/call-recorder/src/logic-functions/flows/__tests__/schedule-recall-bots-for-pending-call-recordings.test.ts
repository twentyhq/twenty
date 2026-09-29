import { type CoreApiClient } from 'twenty-client-sdk/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { scheduleRecallBotsForPendingCallRecordings } from 'src/logic-functions/flows/schedule-recall-bots-for-pending-call-recordings.util';

const enqueueJobsMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  enqueueJobs: enqueueJobsMock,
}));

const NOW = new Date('2026-01-01T12:00:00.000Z');
const WORKSPACE_ID = '123e4567-e89b-12d3-a456-426614174000';
const UPCOMING_STARTS_AT = '2026-01-01T13:00:00.000Z';
const UPCOMING_ENDS_AT = '2026-01-01T14:00:00.000Z';
const PAST_STARTS_AT = '2026-01-01T10:00:00.000Z';
const PAST_ENDS_AT = '2026-01-01T11:00:00.000Z';

const buildAccessToken = (payload: Record<string, unknown>): string =>
  [
    Buffer.from(JSON.stringify({ alg: 'none' })).toString('base64url'),
    Buffer.from(JSON.stringify(payload)).toString('base64url'),
    'signature',
  ].join('.');

const fetchMock = vi.fn();

type CallRecordingNode = {
  id: string;
  status?: string;
  recordingRequestStatus?: string | null;
  calendarEventId?: string | null;
  externalBotId?: string | null;
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

const matchesCallRecordingFilter = (
  callRecording: CallRecordingNode,
  filter: Record<string, { eq?: unknown; in?: unknown[]; is?: 'NULL' }>,
): boolean =>
  Object.entries(filter).every(([field, condition]) => {
    const value = callRecording[field as keyof CallRecordingNode] ?? null;

    if (condition.is === 'NULL') {
      return value === null || value === '';
    }

    if (condition.in !== undefined) {
      return condition.in.includes(value);
    }

    if ('eq' in condition) {
      return value === condition.eq;
    }

    throw new Error(
      `Unhandled filter on ${field}: ${JSON.stringify(condition)}`,
    );
  });

class FakeCoreApiClient {
  callRecordings: CallRecordingNode[];
  calendarEvents: CalendarEventNode[];

  constructor({
    callRecordings = [],
    calendarEvents = [],
  }: {
    callRecordings?: CallRecordingNode[];
    calendarEvents?: CalendarEventNode[];
  }) {
    this.callRecordings = callRecordings;
    this.calendarEvents = calendarEvents;
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

      return { callRecordings: buildConnection(matches) };
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
        (callRecording) => matchesCallRecordingFilter(callRecording, filter),
      );

      matchingCallRecordings.forEach((callRecording) =>
        Object.assign(callRecording, data),
      );

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
    enqueueJobsMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.useRealTimers();
    vi.restoreAllMocks();
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

    expect(result.enqueuedCallRecordingIds).toEqual([]);
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

    expect(result.enqueuedCallRecordingIds).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
