import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { fetchCalendarEventAttendees } from 'src/logic-functions/data/fetch-calendar-event-attendees.util';

const queryMock = vi.fn();

const CLIENT: CoreApiClient = Object.assign(
  Object.create(CoreApiClient.prototype),
  {
    query: queryMock,
    mutation: vi.fn(),
  },
);

type ParticipantNode = {
  calendarEventId: string | null;
  workspaceMemberId: string | null;
};

const buildPage = ({
  participants,
  hasNextPage = false,
  endCursor = null,
}: {
  participants: ParticipantNode[];
  hasNextPage?: boolean;
  endCursor?: string | null;
}) => ({
  calendarEventParticipants: {
    pageInfo: { hasNextPage, endCursor },
    edges: participants.map((participant) => ({ node: participant })),
  },
});

describe('fetchCalendarEventAttendees', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns an empty map without querying when no event ids are given', async () => {
    const result = await fetchCalendarEventAttendees(CLIENT, []);

    expect(result.size).toBe(0);
    expect(queryMock).not.toHaveBeenCalled();
  });

  it('filters participants to the given events', async () => {
    queryMock.mockResolvedValue(buildPage({ participants: [] }));

    await fetchCalendarEventAttendees(CLIENT, [
      'calendar-event-1',
      'calendar-event-2',
    ]);

    expect(queryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        calendarEventParticipants: expect.objectContaining({
          __args: expect.objectContaining({
            filter: {
              calendarEventId: { in: ['calendar-event-1', 'calendar-event-2'] },
            },
          }),
        }),
      }),
    );
  });

  it('groups unique member ids per event across pages and flags unmatched attendees as external', async () => {
    queryMock
      .mockResolvedValueOnce(
        buildPage({
          participants: [
            {
              calendarEventId: 'calendar-event-1',
              workspaceMemberId: 'member-1',
            },
            { calendarEventId: 'calendar-event-1', workspaceMemberId: null },
          ],
          hasNextPage: true,
          endCursor: 'cursor-1',
        }),
      )
      .mockResolvedValueOnce(
        buildPage({
          participants: [
            {
              calendarEventId: 'calendar-event-1',
              workspaceMemberId: 'member-1',
            },
            {
              calendarEventId: 'calendar-event-1',
              workspaceMemberId: 'member-2',
            },
            {
              calendarEventId: 'calendar-event-2',
              workspaceMemberId: 'member-2',
            },
            { calendarEventId: null, workspaceMemberId: 'member-3' },
          ],
        }),
      );

    const result = await fetchCalendarEventAttendees(CLIENT, [
      'calendar-event-1',
      'calendar-event-2',
      'calendar-event-3',
    ]);

    expect(queryMock).toHaveBeenCalledTimes(2);
    expect(queryMock.mock.calls[1][0]).toEqual(
      expect.objectContaining({
        calendarEventParticipants: expect.objectContaining({
          __args: expect.objectContaining({ after: 'cursor-1' }),
        }),
      }),
    );
    expect(result.get('calendar-event-1')).toEqual({
      workspaceMemberIds: ['member-1', 'member-2'],
      hasExternalAttendee: true,
    });
    expect(result.get('calendar-event-2')).toEqual({
      workspaceMemberIds: ['member-2'],
      hasExternalAttendee: false,
    });
    expect(result.has('calendar-event-3')).toBe(false);
  });
});
