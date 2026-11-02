import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { fetchCalendarEventsByFilter } from 'src/logic-functions/data/fetch-calendar-events-by-filter.util';

const queryMock = vi.fn();

const CLIENT: CoreApiClient = Object.assign(
  Object.create(CoreApiClient.prototype),
  {
    query: queryMock,
    mutation: vi.fn(),
  },
);

const buildConnection = <TNode>(nodes: TNode[]) => ({
  pageInfo: { hasNextPage: false, endCursor: null },
  edges: nodes.map((node) => ({ node })),
});

describe('fetchCalendarEventsByFilter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('attaches the matched member ids and external flag of each event attendees', async () => {
    queryMock.mockImplementation(async (query: Record<string, unknown>) => {
      if ('calendarEvents' in query) {
        return {
          calendarEvents: buildConnection([
            { id: 'calendar-event-1', startsAt: '2026-01-01T13:00:00.000Z' },
            { id: 'calendar-event-2', startsAt: '2026-01-01T15:00:00.000Z' },
          ]),
        };
      }

      return {
        calendarEventParticipants: buildConnection([
          {
            calendarEventId: 'calendar-event-1',
            workspaceMemberId: 'member-1',
          },
          {
            calendarEventId: 'calendar-event-1',
            workspaceMemberId: 'member-2',
          },
          { calendarEventId: 'calendar-event-2', workspaceMemberId: null },
        ]),
      };
    });

    const result = await fetchCalendarEventsByFilter(CLIENT, {
      id: { in: ['calendar-event-1', 'calendar-event-2'] },
    });

    expect(queryMock).toHaveBeenCalledTimes(2);
    expect(queryMock.mock.calls[1][0]).toEqual(
      expect.objectContaining({
        calendarEventParticipants: expect.objectContaining({
          __args: expect.objectContaining({
            filter: expect.objectContaining({
              calendarEventId: { in: ['calendar-event-1', 'calendar-event-2'] },
            }),
          }),
        }),
      }),
    );
    expect(
      result.map(({ participantWorkspaceMemberIds, hasExternalAttendee }) => ({
        participantWorkspaceMemberIds,
        hasExternalAttendee,
      })),
    ).toEqual([
      {
        participantWorkspaceMemberIds: ['member-1', 'member-2'],
        hasExternalAttendee: false,
      },
      { participantWorkspaceMemberIds: [], hasExternalAttendee: true },
    ]);
  });

  it('does not look up participants when no event matches', async () => {
    queryMock.mockResolvedValue({ calendarEvents: buildConnection([]) });

    const result = await fetchCalendarEventsByFilter(CLIENT, {
      id: { in: ['calendar-event-1'] },
    });

    expect(result).toEqual([]);
    expect(queryMock).toHaveBeenCalledTimes(1);
  });
});
