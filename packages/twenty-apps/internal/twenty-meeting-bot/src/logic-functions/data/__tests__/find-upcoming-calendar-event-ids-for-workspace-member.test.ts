import { type CoreApiClient } from 'twenty-client-sdk/core';
import { describe, expect, it } from 'vitest';

import { findUpcomingCalendarEventIdsForWorkspaceMember } from 'src/logic-functions/data/find-upcoming-calendar-event-ids-for-workspace-member.util';

const NOW = new Date('2026-01-01T12:00:00.000Z');

type ParticipantNode = {
  id: string;
  calendarEventId: string | null;
  workspaceMemberId: string | null;
};

type CalendarEventNode = {
  id: string;
  startsAt: string | null;
};

class FakeCoreApiClient {
  calendarEventQueryCount = 0;

  constructor(
    private readonly participants: ParticipantNode[],
    private readonly calendarEvents: CalendarEventNode[],
  ) {}

  async query(query: any): Promise<any> {
    if (query.calendarEventParticipants !== undefined) {
      const workspaceMemberId =
        query.calendarEventParticipants.__args.filter.workspaceMemberId.eq;

      return {
        calendarEventParticipants: buildConnection(
          this.participants.filter(
            (participant) =>
              participant.workspaceMemberId === workspaceMemberId,
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
  it('returns only the upcoming calendar events the member participates in', async () => {
    const client = new FakeCoreApiClient(
      [
        {
          id: 'participant-1',
          calendarEventId: 'calendar-event-upcoming',
          workspaceMemberId: 'workspace-member-1',
        },
        {
          id: 'participant-2',
          calendarEventId: 'calendar-event-past',
          workspaceMemberId: 'workspace-member-1',
        },
        {
          id: 'participant-3',
          calendarEventId: 'calendar-event-other-member',
          workspaceMemberId: 'workspace-member-2',
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

  it('keeps recently started meetings inside the lookback window', async () => {
    const client = new FakeCoreApiClient(
      [
        {
          id: 'participant-1',
          calendarEventId: 'calendar-event-in-progress',
          workspaceMemberId: 'workspace-member-1',
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

  it('does not query calendar events when the member has no participations', async () => {
    const client = new FakeCoreApiClient([], []);

    const calendarEventIds =
      await findUpcomingCalendarEventIdsForWorkspaceMember({
        client: client as unknown as CoreApiClient,
        workspaceMemberId: 'workspace-member-1',
        now: NOW,
      });

    expect(calendarEventIds).toEqual([]);
    expect(client.calendarEventQueryCount).toBe(0);
  });
});
