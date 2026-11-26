import { describe, expect, it, vi } from 'vitest';

import { fetchCalendarEventsByFilter } from 'src/logic-functions/data/fetch-calendar-events-by-filter.util';

type CalendarEventParticipantsConnection = {
  totalCount: number;
  edges: {
    node: { handle: string | null; workspaceMemberId: string | null };
  }[];
};

const fetchCalendarEventWithParticipants = async (
  calendarEventParticipants?: CalendarEventParticipantsConnection,
) => {
  const [calendarEvent] = await fetchCalendarEventsByFilter(
    {
      query: vi.fn().mockResolvedValue({
        calendarEvents: {
          pageInfo: { hasNextPage: false, endCursor: null },
          edges: [
            { node: { id: 'calendar-event-1', calendarEventParticipants } },
          ],
        },
      }),
    },
    {},
  );

  return calendarEvent;
};

describe('fetchCalendarEventsByFilter', () => {
  it('returns each participant with its address and whether it is a workspace member', async () => {
    const calendarEvent = await fetchCalendarEventWithParticipants({
      totalCount: 3,
      edges: [
        {
          node: {
            handle: 'ada@acme.com',
            workspaceMemberId: 'workspace-member-1',
          },
        },
        { node: { handle: 'buyer@customer.com', workspaceMemberId: null } },
        { node: { handle: '', workspaceMemberId: null } },
      ],
    });

    expect(calendarEvent.participants).toEqual([
      { handle: 'ada@acme.com', isWorkspaceMember: true },
      { handle: 'buyer@customer.com', isWorkspaceMember: false },
      { handle: undefined, isWorkspaceMember: false },
    ]);
    expect(calendarEvent.hasUnlistedParticipants).toBe(false);
  });

  it('flags an event that has more participants than were returned', async () => {
    const calendarEvent = await fetchCalendarEventWithParticipants({
      totalCount: 2,
      edges: [{ node: { handle: 'ada@acme.com', workspaceMemberId: null } }],
    });

    expect(calendarEvent.hasUnlistedParticipants).toBe(true);
  });

  it('returns no participants for an event that has none', async () => {
    const calendarEvent = await fetchCalendarEventWithParticipants();

    expect(calendarEvent.participants).toEqual([]);
    expect(calendarEvent.hasUnlistedParticipants).toBe(false);
  });
});
