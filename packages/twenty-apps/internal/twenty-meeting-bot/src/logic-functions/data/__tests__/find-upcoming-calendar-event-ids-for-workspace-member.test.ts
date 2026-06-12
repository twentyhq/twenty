import { type CoreApiClient } from 'twenty-client-sdk/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { findUpcomingCalendarEventIdsForWorkspaceMember } from 'src/logic-functions/data/find-upcoming-calendar-event-ids-for-workspace-member.util';
import { type CalendarChannelOwner } from 'src/logic-functions/data/fetch-calendar-channel-owners.util';

const { fetchCalendarChannelOwnersMock } = vi.hoisted(() => ({
  fetchCalendarChannelOwnersMock:
    vi.fn<() => Promise<CalendarChannelOwner[]>>(),
}));

vi.mock('src/logic-functions/data/fetch-calendar-channel-owners.util', () => ({
  fetchCalendarChannelOwners: fetchCalendarChannelOwnersMock,
}));

const NOW = new Date('2026-01-01T12:00:00.000Z');

type AssociationNode = {
  id: string;
  calendarEventId: string | null;
  calendarChannelId: string | null;
};

type CalendarEventNode = {
  id: string;
  startsAt: string | null;
};

class FakeCoreApiClient {
  associationQueryCount = 0;
  calendarEventQueryCount = 0;

  constructor(
    private readonly associations: AssociationNode[],
    private readonly calendarEvents: CalendarEventNode[],
  ) {}

  async query(query: any): Promise<any> {
    if (query.calendarChannelEventAssociations !== undefined) {
      this.associationQueryCount += 1;
      const calendarChannelIds: string[] =
        query.calendarChannelEventAssociations.__args.filter.calendarChannelId
          .in;

      return {
        calendarChannelEventAssociations: buildConnection(
          this.associations.filter(
            (association) =>
              association.calendarChannelId !== null &&
              calendarChannelIds.includes(association.calendarChannelId),
          ),
        ),
      };
    }

    if (query.calendarEvents !== undefined) {
      this.calendarEventQueryCount += 1;
      const filter = query.calendarEvents.__args.filter;
      const calendarEventIds: string[] = filter.id.in;
      const lowerBound: string = filter.startsAt.gte;

      return {
        calendarEvents: buildConnection(
          this.calendarEvents.filter(
            (calendarEvent) =>
              calendarEventIds.includes(calendarEvent.id) &&
              calendarEvent.startsAt !== null &&
              calendarEvent.startsAt >= lowerBound,
          ),
        ),
      };
    }

    throw new Error(`Unhandled query: ${JSON.stringify(query)}`);
  }
}

const buildConnection = <Node>(nodes: Node[]) => ({
  pageInfo: {
    hasNextPage: false,
    endCursor: undefined,
  },
  edges: nodes.map((node) => ({ node })),
});

describe('findUpcomingCalendarEventIdsForWorkspaceMember', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns only the upcoming calendar events synced by the member channels', async () => {
    fetchCalendarChannelOwnersMock.mockResolvedValue([
      {
        calendarChannelId: 'channel-1',
        workspaceMemberId: 'workspace-member-1',
      },
      {
        calendarChannelId: 'channel-2',
        workspaceMemberId: 'workspace-member-2',
      },
    ]);
    const client = new FakeCoreApiClient(
      [
        {
          id: 'association-1',
          calendarEventId: 'calendar-event-upcoming',
          calendarChannelId: 'channel-1',
        },
        {
          id: 'association-2',
          calendarEventId: 'calendar-event-past',
          calendarChannelId: 'channel-1',
        },
        {
          id: 'association-3',
          calendarEventId: 'calendar-event-other-member',
          calendarChannelId: 'channel-2',
        },
      ],
      [
        { id: 'calendar-event-upcoming', startsAt: '2026-01-01T13:00:00.000Z' },
        { id: 'calendar-event-past', startsAt: '2025-12-01T13:00:00.000Z' },
        {
          id: 'calendar-event-other-member',
          startsAt: '2026-01-01T13:00:00.000Z',
        },
      ],
    );

    const calendarEventIds =
      await findUpcomingCalendarEventIdsForWorkspaceMember({
        client: client as unknown as CoreApiClient,
        workspaceMemberId: 'workspace-member-1',
        now: NOW,
      });

    expect(calendarEventIds).toEqual(['calendar-event-upcoming']);
  });

  it('includes events from ownerless channels so a deleted member still reconciles', async () => {
    fetchCalendarChannelOwnersMock.mockResolvedValue([
      { calendarChannelId: 'channel-orphaned', workspaceMemberId: undefined },
    ]);
    const client = new FakeCoreApiClient(
      [
        {
          id: 'association-1',
          calendarEventId: 'calendar-event-orphaned',
          calendarChannelId: 'channel-orphaned',
        },
      ],
      [
        {
          id: 'calendar-event-orphaned',
          startsAt: '2026-01-01T13:00:00.000Z',
        },
      ],
    );

    const calendarEventIds =
      await findUpcomingCalendarEventIdsForWorkspaceMember({
        client: client as unknown as CoreApiClient,
        workspaceMemberId: 'workspace-member-deleted',
        now: NOW,
      });

    expect(calendarEventIds).toEqual(['calendar-event-orphaned']);
  });

  it('keeps recently started meetings inside the lookback window', async () => {
    fetchCalendarChannelOwnersMock.mockResolvedValue([
      {
        calendarChannelId: 'channel-1',
        workspaceMemberId: 'workspace-member-1',
      },
    ]);
    const client = new FakeCoreApiClient(
      [
        {
          id: 'association-1',
          calendarEventId: 'calendar-event-in-progress',
          calendarChannelId: 'channel-1',
        },
      ],
      [
        {
          id: 'calendar-event-in-progress',
          startsAt: '2026-01-01T09:00:00.000Z',
        },
      ],
    );

    const calendarEventIds =
      await findUpcomingCalendarEventIdsForWorkspaceMember({
        client: client as unknown as CoreApiClient,
        workspaceMemberId: 'workspace-member-1',
        now: NOW,
      });

    expect(calendarEventIds).toEqual(['calendar-event-in-progress']);
  });

  it('does not query associations when the member owns no channels', async () => {
    fetchCalendarChannelOwnersMock.mockResolvedValue([
      {
        calendarChannelId: 'channel-2',
        workspaceMemberId: 'workspace-member-2',
      },
    ]);
    const client = new FakeCoreApiClient([], []);

    const calendarEventIds =
      await findUpcomingCalendarEventIdsForWorkspaceMember({
        client: client as unknown as CoreApiClient,
        workspaceMemberId: 'workspace-member-1',
        now: NOW,
      });

    expect(calendarEventIds).toEqual([]);
    expect(client.associationQueryCount).toBe(0);
    expect(client.calendarEventQueryCount).toBe(0);
  });
});
