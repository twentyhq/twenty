import { type CoreApiClient } from 'twenty-client-sdk/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { reconcileRecallRecordingBotForCalendarEventIds } from 'src/logic-functions/utils/reconcile-recall-recording-bot.util';

const getRecallRecordingBotEnabledMock = vi.hoisted(() => vi.fn());
const scheduleRecallRecordingBotMock = vi.hoisted(() => vi.fn());
const rescheduleRecallRecordingBotMock = vi.hoisted(() => vi.fn());
const cancelRecallRecordingBotMock = vi.hoisted(() => vi.fn());

vi.mock(
  'src/logic-functions/utils/get-recall-recording-bot-enabled.util',
  () => ({
    getRecallRecordingBotEnabled: getRecallRecordingBotEnabledMock,
  }),
);

vi.mock('src/logic-functions/utils/recall-bot-api.util', () => ({
  scheduleRecallRecordingBot: scheduleRecallRecordingBotMock,
  rescheduleRecallRecordingBot: rescheduleRecallRecordingBotMock,
  cancelRecallRecordingBot: cancelRecallRecordingBotMock,
}));

const NOW = new Date('2026-01-01T12:00:00.000Z');
const FUTURE_STARTS_AT = '2026-01-01T13:00:00.000Z';
const FUTURE_ENDS_AT = '2026-01-01T14:00:00.000Z';

type CalendarEventNode = {
  id: string;
  title?: string | null;
  isCanceled?: boolean | null;
  startsAt?: string | null;
  endsAt?: string | null;
  iCalUid?: string | null;
  conferenceLink?: { primaryLinkUrl?: string | null } | null;
  recallRecordingBotPreference?: string | null;
};

type CalendarEventParticipantNode = {
  id: string;
  calendarEventId?: string | null;
  workspaceMemberId?: string | null;
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
  calendarEventParticipants?: CalendarEventParticipantNode[];
  callRecordings?: CallRecordingNode[];
};

class FakeCoreApiClient {
  calendarEvents: CalendarEventNode[];
  calendarEventParticipants: CalendarEventParticipantNode[];
  callRecordings: CallRecordingNode[];
  mutations: Array<{ name: string; args: unknown }> = [];

  constructor({
    calendarEvents,
    calendarEventParticipants = [],
    callRecordings = [],
  }: FakeCoreApiClientFixture) {
    this.calendarEvents = calendarEvents;
    this.calendarEventParticipants = calendarEventParticipants;
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

    if (query.calendarEventParticipants !== undefined) {
      const calendarEventIds =
        query.calendarEventParticipants.__args.filter.calendarEventId.in;

      return {
        calendarEventParticipants: buildConnection(
          this.calendarEventParticipants.filter((participant) =>
            calendarEventIds.includes(participant.calendarEventId),
          ),
        ),
      };
    }

    if (query.callRecordings !== undefined) {
      const calendarEventIds =
        query.callRecordings.__args.filter.calendarEventId.in;

      return {
        callRecordings: buildConnection(
          this.callRecordings.filter((callRecording) =>
            calendarEventIds.includes(callRecording.calendarEventId),
          ),
        ),
      };
    }

    throw new Error(`Unhandled query: ${JSON.stringify(query)}`);
  }

  async mutation(mutation: any): Promise<any> {
    if (mutation.createCallRecording !== undefined) {
      const data = mutation.createCallRecording.__args.data;
      const createdCallRecording = {
        id: `call-recording-${this.callRecordings.length + 1}`,
        ...data,
      };

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
    primaryLinkUrl: 'https://meet.example.com/customer-sync',
  },
  recallRecordingBotPreference: 'ON',
  ...overrides,
});

const buildFakeCoreApiClient = (
  fixture: FakeCoreApiClientFixture,
): FakeCoreApiClient => new FakeCoreApiClient(fixture);

describe('reconcileRecallRecordingBotForCalendarEventIds', () => {
  beforeEach(() => {
    getRecallRecordingBotEnabledMock.mockReset();
    getRecallRecordingBotEnabledMock.mockResolvedValue(true);
    scheduleRecallRecordingBotMock.mockReset();
    scheduleRecallRecordingBotMock.mockResolvedValue({
      ok: true,
      externalBotId: 'recall-bot-1',
    });
    rescheduleRecallRecordingBotMock.mockReset();
    rescheduleRecallRecordingBotMock.mockResolvedValue({
      ok: true,
      externalBotId: 'recall-bot-1',
    });
    cancelRecallRecordingBotMock.mockReset();
    cancelRecallRecordingBotMock.mockResolvedValue({
      ok: true,
      externalBotId: null,
    });
  });

  it('creates a scheduled call recording when the policy requests a bot', async () => {
    const client = buildFakeCoreApiClient({
      calendarEvents: [buildCalendarEvent()],
    });

    const result = await reconcileRecallRecordingBotForCalendarEventIds({
      client: client as unknown as CoreApiClient,
      calendarEventIds: ['calendar-event-1'],
      now: NOW,
    });

    expect(result).toEqual([
      expect.objectContaining({
        action: 'CREATED',
        callRecordingId: 'call-recording-1',
      }),
    ]);
    expect(client.callRecordings).toEqual([
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
    ]);
    expect(scheduleRecallRecordingBotMock).toHaveBeenCalledWith({
      meetingUrl: 'https://meet.example.com/customer-sync',
      joinAt: FUTURE_STARTS_AT,
      metadata: {
        twentyCallRecordingId: 'call-recording-1',
        twentyCalendarEventId: 'calendar-event-1',
        twentyRealMeetingKey:
          'link:meet.example.com/customer-sync:2026-01-01T13:00:00.000Z',
      },
    });
  });

  it('updates an existing policy-managed scheduled call recording', async () => {
    const client = buildFakeCoreApiClient({
      calendarEvents: [
        buildCalendarEvent({
          title: 'Updated Customer Sync',
          startsAt: '2026-01-01T15:00:00.000Z',
          endsAt: '2026-01-01T16:00:00.000Z',
        }),
      ],
      callRecordings: [
        {
          id: 'call-recording-1',
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

    const result = await reconcileRecallRecordingBotForCalendarEventIds({
      client: client as unknown as CoreApiClient,
      calendarEventIds: ['calendar-event-1'],
      now: NOW,
    });

    expect(result).toEqual([
      expect.objectContaining({
        action: 'UPDATED',
        callRecordingId: 'call-recording-1',
      }),
    ]);
    expect(client.callRecordings).toEqual([
      expect.objectContaining({
        id: 'call-recording-1',
        title: 'Updated Customer Sync',
        status: 'SCHEDULED',
        recordingRequestStatus: 'REQUESTED',
        startedAt: '2026-01-01T15:00:00.000Z',
        endedAt: '2026-01-01T16:00:00.000Z',
        calendarEventId: 'calendar-event-1',
        externalBotId: 'recall-bot-1',
      }),
    ]);
    expect(rescheduleRecallRecordingBotMock).toHaveBeenCalledWith({
      externalBotId: 'recall-bot-1',
      meetingUrl: 'https://meet.example.com/customer-sync',
      joinAt: '2026-01-01T15:00:00.000Z',
      metadata: {
        twentyCallRecordingId: 'call-recording-1',
        twentyCalendarEventId: 'calendar-event-1',
        twentyRealMeetingKey:
          'link:meet.example.com/customer-sync:2026-01-01T15:00:00.000Z',
      },
    });
  });

  it('cancels an existing scheduled request when the policy no longer requests a bot', async () => {
    const client = buildFakeCoreApiClient({
      calendarEvents: [
        buildCalendarEvent({
          recallRecordingBotPreference: 'OFF',
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

    const result = await reconcileRecallRecordingBotForCalendarEventIds({
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
    expect(cancelRecallRecordingBotMock).toHaveBeenCalledWith({
      externalBotId: 'recall-bot-1',
    });
  });

  it('cancels duplicate policy-managed recordings and keeps the one carrying the bot', async () => {
    const client = buildFakeCoreApiClient({
      calendarEvents: [buildCalendarEvent()],
      callRecordings: [
        {
          id: 'call-recording-1',
          title: 'Customer Sync',
          status: 'SCHEDULED',
          recordingRequestStatus: 'REQUESTED',
          startedAt: FUTURE_STARTS_AT,
          endedAt: FUTURE_ENDS_AT,
          calendarEventId: 'calendar-event-1',
          externalBotId: null,
        },
        {
          id: 'call-recording-2',
          title: 'Customer Sync',
          status: 'SCHEDULED',
          recordingRequestStatus: 'REQUESTED',
          startedAt: FUTURE_STARTS_AT,
          endedAt: FUTURE_ENDS_AT,
          calendarEventId: 'calendar-event-1',
          externalBotId: 'recall-bot-2',
        },
      ],
    });

    const result = await reconcileRecallRecordingBotForCalendarEventIds({
      client: client as unknown as CoreApiClient,
      calendarEventIds: ['calendar-event-1'],
      now: NOW,
    });

    expect(result).toEqual([
      expect.objectContaining({
        action: 'UPDATED',
        callRecordingId: 'call-recording-2',
      }),
    ]);
    expect(client.callRecordings).toEqual([
      expect.objectContaining({
        id: 'call-recording-1',
        recordingRequestStatus: 'CANCELED',
        externalBotId: null,
      }),
      expect.objectContaining({
        id: 'call-recording-2',
        recordingRequestStatus: 'REQUESTED',
        externalBotId: 'recall-bot-2',
      }),
    ]);
    expect(cancelRecallRecordingBotMock).not.toHaveBeenCalled();
    expect(rescheduleRecallRecordingBotMock).toHaveBeenCalledWith(
      expect.objectContaining({ externalBotId: 'recall-bot-2' }),
    );
    expect(scheduleRecallRecordingBotMock).not.toHaveBeenCalled();
  });

  it('keeps the request open for retry when the Recall cancel fails', async () => {
    cancelRecallRecordingBotMock.mockResolvedValue({
      ok: false,
      errorMessage: 'Recall API responded with HTTP 500',
    });

    const client = buildFakeCoreApiClient({
      calendarEvents: [
        buildCalendarEvent({
          recallRecordingBotPreference: 'OFF',
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

    const result = await reconcileRecallRecordingBotForCalendarEventIds({
      client: client as unknown as CoreApiClient,
      calendarEventIds: ['calendar-event-1'],
      now: NOW,
    });

    expect(result).toEqual([
      expect.objectContaining({
        action: 'SKIPPED',
        callRecordingId: null,
      }),
    ]);
    expect(client.callRecordings).toEqual([
      expect.objectContaining({
        id: 'call-recording-1',
        recordingRequestStatus: 'REQUESTED',
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
          id: 'call-recording-1',
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

    const result = await reconcileRecallRecordingBotForCalendarEventIds({
      client: client as unknown as CoreApiClient,
      calendarEventIds: ['calendar-event-1'],
      now: NOW,
    });

    expect(result).toEqual([
      expect.objectContaining({
        action: 'UPDATED',
        callRecordingId: 'call-recording-1',
      }),
    ]);
    expect(client.callRecordings).toEqual([
      expect.objectContaining({
        id: 'call-recording-1',
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

    const result = await reconcileRecallRecordingBotForCalendarEventIds({
      client: client as unknown as CoreApiClient,
      calendarEventIds: ['calendar-event-1'],
      now: NOW,
    });

    expect(result).toEqual([
      expect.objectContaining({
        action: 'CREATED',
        callRecordingId: 'call-recording-1',
      }),
    ]);
    expect(client.callRecordings).toHaveLength(1);
    expect(scheduleRecallRecordingBotMock).toHaveBeenCalledTimes(1);
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

    const result = await reconcileRecallRecordingBotForCalendarEventIds({
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
    expect(scheduleRecallRecordingBotMock).not.toHaveBeenCalled();
  });
});
