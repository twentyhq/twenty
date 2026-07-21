import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { fetchUpcomingCalendarEventIds } from 'src/logic-functions/data/fetch-upcoming-calendar-event-ids.util';

const queryMock = vi.fn();

const CLIENT: CoreApiClient = Object.assign(
  Object.create(CoreApiClient.prototype),
  {
    query: queryMock,
    mutation: vi.fn(),
  },
);

const NOW = new Date('2026-07-04T12:00:00.000Z');

const buildPage = (
  calendarEventIds: string[],
  { hasNextPage = false, endCursor = null as string | null } = {},
) => ({
  calendarEvents: {
    pageInfo: { hasNextPage, endCursor },
    edges: calendarEventIds.map((calendarEventId) => ({
      node: { id: calendarEventId },
    })),
  },
});

describe('fetchUpcomingCalendarEventIds', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('filters to non-canceled events starting within the scheduling horizon and not yet ended, closest first', async () => {
    queryMock.mockResolvedValue(buildPage(['calendar-event-1']));

    await fetchUpcomingCalendarEventIds(CLIENT, NOW);

    expect(queryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        calendarEvents: expect.objectContaining({
          __args: expect.objectContaining({
            filter: {
              isCanceled: { eq: false },
              or: [
                {
                  and: [
                    { startsAt: { lte: '2026-07-11T12:00:00.000Z' } },
                    { endsAt: { gt: '2026-07-04T12:00:00.000Z' } },
                  ],
                },
                {
                  and: [
                    { endsAt: { is: 'NULL' } },
                    { startsAt: { gt: '2026-07-04T12:00:00.000Z' } },
                    { startsAt: { lte: '2026-07-11T12:00:00.000Z' } },
                  ],
                },
              ],
            },
            orderBy: [{ startsAt: 'AscNullsLast' }],
          }),
        }),
      }),
    );
  });

  it('pages through every result and returns unique sorted ids', async () => {
    queryMock
      .mockResolvedValueOnce(
        buildPage(['calendar-event-2', 'calendar-event-1'], {
          hasNextPage: true,
          endCursor: 'cursor-1',
        }),
      )
      .mockResolvedValueOnce(
        buildPage(['calendar-event-3', 'calendar-event-2']),
      );

    const calendarEventIds = await fetchUpcomingCalendarEventIds(CLIENT, NOW);

    expect(queryMock).toHaveBeenCalledTimes(2);
    expect(queryMock.mock.calls[1][0].calendarEvents.__args.after).toBe(
      'cursor-1',
    );
    expect(calendarEventIds).toEqual([
      'calendar-event-1',
      'calendar-event-2',
      'calendar-event-3',
    ]);
  });

  it('returns an empty list when no upcoming events exist', async () => {
    queryMock.mockResolvedValue(buildPage([]));

    await expect(fetchUpcomingCalendarEventIds(CLIENT, NOW)).resolves.toEqual(
      [],
    );
  });
});
