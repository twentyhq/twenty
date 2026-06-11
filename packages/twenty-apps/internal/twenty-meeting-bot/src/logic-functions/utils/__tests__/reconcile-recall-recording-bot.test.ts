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
  meetingBotPreference?: string | null;
};

type CalendarEventParticipantNode = {
  id: string;
  calendarEventId?: string | null;
  workspaceMemberId?: string | null;
};

type WorkspaceMemberNode = {
  id: string;
  meetingBotAutoRecordEnabled?: boolean | null;
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
  workspaceMembers?: WorkspaceMemberNode[];
  callRecordings?: CallRecordingNode[];
};

class FakeCoreApiClient {
  calendarEvents: CalendarEventNode[];
  calendarEventParticipants: CalendarEventParticipantNode[];
  workspaceMembers: WorkspaceMemberNode[];
  callRecordings: CallRecordingNode[];
  mutations: Array<{ name: string; args: unknown }> = [];

  constructor({
    calendarEvents,
    calendarEventParticipants = [],
    workspaceMembers = [],
    callRecordings = [],
  }: FakeCoreApiClientFixture) {
    this.calendarEvents = calendarEvents;
    this.calendarEventParticipants = calendarEventParticipants;
    this.workspaceMembers = workspaceMembers;
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

    if (query.workspaceMembers !== undefined) {
      const workspaceMemberIds = query.workspaceMembers.__args.filter.id.in;

      return {
        workspaceMembers: buildConnection(
          this.workspaceMembers.filter((workspaceMember) =>
            workspaceMemberIds.includes(workspaceMember.id),
          ),
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

    if (mutation.deleteCallRecording !== undefined) {
      const { id } = mutation.deleteCallRecording.__args;

      this.callRecordings = this.callRecordings.filter(
        (candidate) => candidate.id !== id,
      );
      this.mutations.push({
        name: 'deleteCallRecording',
        args: { id },
      });

      return {
        deleteCallRecording: {
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
  meetingBotPreference: 'ON',
  ...overrides,
});

const buildFakeCoreApiClient = (
  fixture: FakeCoreApiClientFixture,
): FakeCoreApiClient => new FakeCoreApiClient(fixture);

describe('reconcileRecallRecordingBotForCalendarEventIds', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    getRecallRecordingBotEnabledMock.mockReset();
    getRecallRecordingBotEnabledMock.mockReturnValue(true);
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

  it('creates a scheduled call recording when a participating member has auto-record enabled', async () => {
    const client = buildFakeCoreApiClient({
      calendarEvents: [
        buildCalendarEvent({ meetingBotPreference: null }),
      ],
      calendarEventParticipants: [
        {
          id: 'participant-1',
          calendarEventId: 'calendar-event-1',
          workspaceMemberId: 'workspace-member-1',
        },
      ],
      workspaceMembers: [
        { id: 'workspace-member-1', meetingBotAutoRecordEnabled: true },
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
    expect(scheduleRecallRecordingBotMock).toHaveBeenCalledTimes(1);
  });

  it('does not schedule a bot without an override when no participating member has auto-record enabled', async () => {
    const client = buildFakeCoreApiClient({
      calendarEvents: [
        buildCalendarEvent({ meetingBotPreference: null }),
      ],
      calendarEventParticipants: [
        {
          id: 'participant-1',
          calendarEventId: 'calendar-event-1',
          workspaceMemberId: 'workspace-member-1',
        },
        {
          id: 'participant-2',
          calendarEventId: 'calendar-event-1',
          workspaceMemberId: null,
        },
      ],
      workspaceMembers: [
        { id: 'workspace-member-1', meetingBotAutoRecordEnabled: false },
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
      }),
    ]);
    expect(client.mutations).toEqual([]);
    expect(scheduleRecallRecordingBotMock).not.toHaveBeenCalled();
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
        startedAt: FUTURE_STARTS_AT,
        endedAt: FUTURE_ENDS_AT,
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
          meetingBotPreference: 'OFF',
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

  it('deletes bot-less duplicate recordings and keeps the one carrying the bot', async () => {
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
        id: 'call-recording-2',
        recordingRequestStatus: 'REQUESTED',
        externalBotId: 'recall-bot-2',
      }),
    ]);
    expect(client.mutations).toContainEqual({
      name: 'deleteCallRecording',
      args: { id: 'call-recording-1' },
    });
    expect(cancelRecallRecordingBotMock).not.toHaveBeenCalled();
    expect(rescheduleRecallRecordingBotMock).toHaveBeenCalledWith(
      expect.objectContaining({ externalBotId: 'recall-bot-2' }),
    );
    expect(scheduleRecallRecordingBotMock).not.toHaveBeenCalled();
  });

  it('cancels a duplicate that carries its own bot instead of deleting it', async () => {
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
          externalBotId: 'recall-bot-1',
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
        callRecordingId: 'call-recording-1',
      }),
    ]);
    expect(client.callRecordings).toEqual([
      expect.objectContaining({
        id: 'call-recording-1',
        recordingRequestStatus: 'REQUESTED',
        externalBotId: 'recall-bot-1',
      }),
      expect.objectContaining({
        id: 'call-recording-2',
        recordingRequestStatus: 'CANCELED',
        externalBotId: null,
      }),
    ]);
    expect(cancelRecallRecordingBotMock).toHaveBeenCalledWith({
      externalBotId: 'recall-bot-2',
    });
    expect(
      client.mutations.filter(
        (mutation) => mutation.name === 'deleteCallRecording',
      ),
    ).toEqual([]);
  });

  it('keeps the request open for retry when the Recall cancel fails', async () => {
    cancelRecallRecordingBotMock.mockResolvedValue({
      ok: false,
      status: 500,
      errorMessage: 'Recall API responded with HTTP 500',
    });

    const client = buildFakeCoreApiClient({
      calendarEvents: [
        buildCalendarEvent({
          meetingBotPreference: 'OFF',
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

    const result = await reconcileRecallRecordingBotForCalendarEventIds({
      client: client as unknown as CoreApiClient,
      calendarEventIds: [],
      removedOccurrences: [
        {
          calendarEventId: 'calendar-event-1',
          realMeetingKey: `link:meet.example.com/customer-sync:${FUTURE_STARTS_AT}`,
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
    expect(cancelRecallRecordingBotMock).toHaveBeenCalledWith({
      externalBotId: 'recall-bot-1',
    });
  });

  it('cancels the old bot and schedules a fresh one when the meeting moves to a new time', async () => {
    const NEW_STARTS_AT = '2026-01-02T13:00:00.000Z';
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
          id: 'call-recording-1',
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

    const result = await reconcileRecallRecordingBotForCalendarEventIds({
      client: client as unknown as CoreApiClient,
      calendarEventIds: ['calendar-event-1'],
      removedOccurrences: [
        {
          calendarEventId: 'calendar-event-1',
          realMeetingKey: `link:meet.example.com/customer-sync:${FUTURE_STARTS_AT}`,
          startsAt: FUTURE_STARTS_AT,
        },
      ],
      now: NOW,
    });

    expect(result).toEqual([
      expect.objectContaining({ action: 'CANCELED' }),
      expect.objectContaining({
        action: 'UPDATED',
        callRecordingId: 'call-recording-1',
      }),
    ]);
    expect(cancelRecallRecordingBotMock).toHaveBeenCalledExactlyOnceWith({
      externalBotId: 'recall-bot-old',
    });
    expect(scheduleRecallRecordingBotMock).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ joinAt: NEW_STARTS_AT }),
    );
    expect(client.callRecordings).toEqual([
      expect.objectContaining({
        id: 'call-recording-1',
        recordingRequestStatus: 'REQUESTED',
        startedAt: FUTURE_STARTS_AT,
        externalBotId: 'recall-bot-1',
      }),
    ]);
  });

  it('reconciles the remaining meetings when one meeting fails', async () => {
    cancelRecallRecordingBotMock.mockRejectedValue(
      new Error('recall exploded'),
    );

    const client = buildFakeCoreApiClient({
      calendarEvents: [
        buildCalendarEvent({
          meetingBotPreference: 'OFF',
        }),
        buildCalendarEvent({
          id: 'calendar-event-2',
          iCalUid: 'other-meeting-uid',
          conferenceLink: {
            primaryLinkUrl: 'https://meet.example.com/other-sync',
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

    const result = await reconcileRecallRecordingBotForCalendarEventIds({
      client: client as unknown as CoreApiClient,
      calendarEventIds: ['calendar-event-1', 'calendar-event-2'],
      now: NOW,
    });

    expect(result).toEqual([
      expect.objectContaining({
        action: 'FAILED',
        realMeetingKey: `link:meet.example.com/customer-sync:${FUTURE_STARTS_AT}`,
        errorMessage: 'recall exploded',
      }),
      expect.objectContaining({ action: 'CREATED' }),
    ]);
    expect(client.callRecordings).toEqual([
      expect.objectContaining({
        id: 'call-recording-1',
        recordingRequestStatus: 'REQUESTED',
      }),
      expect.objectContaining({
        calendarEventId: 'calendar-event-2',
        status: 'SCHEDULED',
      }),
    ]);
  });

  it('cancels the scheduled request when preference is ON but the conference link is removed', async () => {
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
  });

  it('schedules a replacement bot when the existing Recall bot no longer exists', async () => {
    rescheduleRecallRecordingBotMock.mockResolvedValue({
      ok: false,
      status: 404,
      errorMessage: 'Recall API responded with HTTP 404',
    });

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
          externalBotId: 'recall-bot-stale',
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
    expect(rescheduleRecallRecordingBotMock).toHaveBeenCalledWith(
      expect.objectContaining({ externalBotId: 'recall-bot-stale' }),
    );
    expect(scheduleRecallRecordingBotMock).toHaveBeenCalledTimes(1);
    expect(client.callRecordings).toEqual([
      expect.objectContaining({
        id: 'call-recording-1',
        externalBotId: 'recall-bot-1',
      }),
    ]);
  });

  it('cancels its own recording without scheduling when a concurrent reconciliation wins the create race', async () => {
    class CreateRaceFakeCoreApiClient extends FakeCoreApiClient {
      private callRecordingsByCalendarEventQueryCount = 0;

      override async query(query: any): Promise<any> {
        if (
          query.callRecordings !== undefined &&
          query.callRecordings.__args.filter.calendarEventId?.in !== undefined
        ) {
          this.callRecordingsByCalendarEventQueryCount += 1;

          if (this.callRecordingsByCalendarEventQueryCount === 2) {
            this.callRecordings.unshift({
              id: 'call-recording-0',
              status: 'SCHEDULED',
              recordingRequestStatus: 'REQUESTED',
              calendarEventId: 'calendar-event-1',
            });
          }
        }

        return super.query(query);
      }
    }

    const client = new CreateRaceFakeCoreApiClient({
      calendarEvents: [buildCalendarEvent()],
    });

    const result = await reconcileRecallRecordingBotForCalendarEventIds({
      client: client as unknown as CoreApiClient,
      calendarEventIds: ['calendar-event-1'],
      now: NOW,
    });

    expect(result).toEqual([
      expect.objectContaining({
        action: 'SKIPPED',
        callRecordingId: 'call-recording-0',
      }),
    ]);
    expect(scheduleRecallRecordingBotMock).not.toHaveBeenCalled();
    expect(client.callRecordings).toEqual([
      expect.objectContaining({ id: 'call-recording-0' }),
      expect.objectContaining({
        id: 'call-recording-1',
        recordingRequestStatus: 'CANCELED',
      }),
    ]);
  });

  it('cancels its own bot when a concurrent schedule overwrites the bot id', async () => {
    class WriteBackRaceFakeCoreApiClient extends FakeCoreApiClient {
      override async mutation(mutation: any): Promise<any> {
        const mutationResult = await super.mutation(mutation);

        if (
          mutation.updateCallRecording?.__args.data.externalBotId ===
          'recall-bot-1'
        ) {
          const callRecording = this.callRecordings.find(
            (candidate) =>
              candidate.id === mutation.updateCallRecording.__args.id,
          );

          if (callRecording !== undefined) {
            callRecording.externalBotId = 'sibling-bot';
          }
        }

        return mutationResult;
      }
    }

    const client = new WriteBackRaceFakeCoreApiClient({
      calendarEvents: [buildCalendarEvent()],
    });

    await reconcileRecallRecordingBotForCalendarEventIds({
      client: client as unknown as CoreApiClient,
      calendarEventIds: ['calendar-event-1'],
      now: NOW,
    });

    expect(scheduleRecallRecordingBotMock).toHaveBeenCalledTimes(1);
    expect(cancelRecallRecordingBotMock).toHaveBeenCalledWith({
      externalBotId: 'recall-bot-1',
    });
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

    const result = await reconcileRecallRecordingBotForCalendarEventIds({
      client: client as unknown as CoreApiClient,
      calendarEventIds: ['calendar-event-1'],
      now: NOW,
    });

    expect(result).toEqual([expect.objectContaining({ action: 'CREATED' })]);
    expect(scheduleRecallRecordingBotMock).not.toHaveBeenCalled();
  });
});
