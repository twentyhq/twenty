import { type CoreApiClient } from 'twenty-client-sdk/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { scheduleRecallBotsForPendingCallRecordings } from 'src/logic-functions/flows/schedule-recall-bots-for-pending-call-recordings.util';

const NOW = new Date('2026-01-01T12:00:00.000Z');
const WORKSPACE_ID = '123e4567-e89b-12d3-a456-426614174000';
const UPCOMING_STARTS_AT = '2026-01-01T13:00:00.000Z';
const UPCOMING_ENDS_AT = '2026-01-01T14:00:00.000Z';
const PAST_STARTS_AT = '2026-01-01T10:00:00.000Z';
const PAST_ENDS_AT = '2026-01-01T11:00:00.000Z';
const RECALL_CREATE_BOT_URL = 'https://us-west-2.recall.ai/api/v1/bot/';

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
    fetchMock.mockImplementation(
      async () =>
        new Response(JSON.stringify({ id: 'recall-bot-1' }), { status: 201 }),
    );
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
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [requestUrl, requestInit] = fetchMock.mock.calls[0];
    expect(requestUrl).toBe(RECALL_CREATE_BOT_URL);
    expect(requestInit.method).toBe('POST');
    expect(requestInit.headers).toMatchObject({
      Authorization: 'Token recall-api-key',
    });
    expect(JSON.parse(requestInit.body)).toMatchObject({
      meeting_url: 'https://meet.example.com/customer-sync',
      join_at: '2026-01-01T12:59:00.000Z',
      metadata: {
        twentyWorkspaceId: WORKSPACE_ID,
        twentyCallRecordingId: 'call-recording-1',
      },
    });
    expect(client.callRecordings[0].externalBotId).toBe('recall-bot-1');
  });

  it('does not report a recording as scheduled when Recall scheduling fails', async () => {
    fetchMock.mockImplementation(
      async () =>
        new Response(JSON.stringify({ error: 'boom' }), { status: 500 }),
    );
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
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(
      fetchMock.mock.calls.every(
        ([requestUrl]) => requestUrl === RECALL_CREATE_BOT_URL,
      ),
    ).toBe(true);
    expect(client.callRecordings[0].externalBotId).toBeNull();
  });

  it('skips a recording whose meeting has already ended', async () => {
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
    expect(fetchMock).not.toHaveBeenCalled();
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
