import { type CoreApiClient } from 'twenty-client-sdk/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { healCallRecordingsMissingBot } from 'src/logic-functions/flows/heal-call-recordings-missing-bot.util';

const scheduleRecallBotMock = vi.hoisted(() => vi.fn());
const getCurrentWorkspaceIdMock = vi.hoisted(() => vi.fn());

vi.mock('src/logic-functions/data/get-current-workspace-id.util', () => ({
  getCurrentWorkspaceId: getCurrentWorkspaceIdMock,
}));

vi.mock('src/logic-functions/recall-api/schedule-recall-bot.util', () => ({
  scheduleRecallBot: scheduleRecallBotMock,
}));

const NOW = new Date('2026-01-01T12:00:00.000Z');
const WORKSPACE_ID = '123e4567-e89b-12d3-a456-426614174000';
const UPCOMING_STARTS_AT = '2026-01-01T13:00:00.000Z';
const UPCOMING_ENDS_AT = '2026-01-01T14:00:00.000Z';
const PAST_STARTS_AT = '2026-01-01T10:00:00.000Z';
const PAST_ENDS_AT = '2026-01-01T11:00:00.000Z';

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

const buildBotlessCallRecording = (
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

describe('healCallRecordingsMissingBot', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    getCurrentWorkspaceIdMock.mockReset();
    getCurrentWorkspaceIdMock.mockReturnValue(WORKSPACE_ID);
    scheduleRecallBotMock.mockReset();
    scheduleRecallBotMock.mockResolvedValue({
      ok: true,
      externalBotId: 'recall-bot-1',
    });
  });

  it('schedules a bot and writes the id for an upcoming botless recording', async () => {
    const client = new FakeCoreApiClient({
      callRecordings: [buildBotlessCallRecording()],
      calendarEvents: [buildCalendarEvent()],
    });

    const result = await healCallRecordingsMissingBot({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(result.scheduledCallRecordingIds).toEqual(['call-recording-1']);
    expect(scheduleRecallBotMock).toHaveBeenCalledTimes(1);
    expect(scheduleRecallBotMock).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          twentyWorkspaceId: WORKSPACE_ID,
        }),
      }),
    );
    expect(client.callRecordings[0].externalBotId).toBe('recall-bot-1');
  });

  it('does not report a recording as scheduled when Recall scheduling fails', async () => {
    scheduleRecallBotMock.mockResolvedValue({
      ok: false,
      status: 500,
      errorMessage: 'Recall API responded with HTTP 500',
    });
    const client = new FakeCoreApiClient({
      callRecordings: [buildBotlessCallRecording()],
      calendarEvents: [buildCalendarEvent()],
    });

    const result = await healCallRecordingsMissingBot({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(result.scheduledCallRecordingIds).toEqual([]);
    expect(scheduleRecallBotMock).toHaveBeenCalledTimes(1);
    expect(client.callRecordings[0].externalBotId).toBeNull();
  });

  it('skips a recording whose meeting has already ended', async () => {
    const client = new FakeCoreApiClient({
      callRecordings: [buildBotlessCallRecording()],
      calendarEvents: [
        buildCalendarEvent({
          startsAt: PAST_STARTS_AT,
          endsAt: PAST_ENDS_AT,
        }),
      ],
    });

    const result = await healCallRecordingsMissingBot({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(result.scheduledCallRecordingIds).toEqual([]);
    expect(scheduleRecallBotMock).not.toHaveBeenCalled();
  });

  it('does nothing when every scheduled recording already has a bot', async () => {
    const client = new FakeCoreApiClient({
      callRecordings: [
        buildBotlessCallRecording({ externalBotId: 'recall-bot-existing' }),
      ],
      calendarEvents: [buildCalendarEvent()],
    });

    const result = await healCallRecordingsMissingBot({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(result.scheduledCallRecordingIds).toEqual([]);
    expect(scheduleRecallBotMock).not.toHaveBeenCalled();
  });
});
