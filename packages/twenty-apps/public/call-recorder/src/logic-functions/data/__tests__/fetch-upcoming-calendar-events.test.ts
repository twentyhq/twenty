import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { fetchUpcomingCalendarEvents } from 'src/logic-functions/data/fetch-upcoming-calendar-events.util';

const queryMock = vi.fn();

const CLIENT: CoreApiClient = Object.assign(
  Object.create(CoreApiClient.prototype),
  {
    query: queryMock,
    mutation: vi.fn(),
  },
);

const NOW = new Date('2026-07-04T12:00:00.000Z');

const buildPage = ({
  calendarEventNodes,
  hasNextPage = false,
  endCursor = null,
}: {
  calendarEventNodes: Array<{ id: string; startsAt?: string | null }>;
  hasNextPage?: boolean;
  endCursor?: string | null;
}) => ({
  calendarEvents: {
    pageInfo: { hasNextPage, endCursor },
    edges: calendarEventNodes.map((calendarEventNode) => ({
      node: calendarEventNode,
    })),
  },
});

describe('fetchUpcomingCalendarEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('filters to non-canceled events starting within the scheduling horizon and not yet ended, closest first', async () => {
    queryMock.mockResolvedValue(
      buildPage({ calendarEventNodes: [{ id: 'calendar-event-1' }] }),
    );

    await fetchUpcomingCalendarEvents(CLIENT, NOW);

    expect(queryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        calendarEvents: expect.objectContaining({
          __args: expect.objectContaining({
            filter: {
              isCanceled: { eq: false },
              or: [
                {
                  and: [
                    { startsAt: { lte: '2026-07-05T12:00:00.000Z' } },
                    { endsAt: { gt: '2026-07-04T12:00:00.000Z' } },
                  ],
                },
                {
                  and: [
                    { endsAt: { is: 'NULL' } },
                    { startsAt: { gt: '2026-07-04T12:00:00.000Z' } },
                    { startsAt: { lte: '2026-07-05T12:00:00.000Z' } },
                  ],
                },
              ],
            },
            orderBy: [{ startsAt: 'AscNullsLast' }],
          }),
          edges: { node: { id: true, startsAt: true } },
        }),
      }),
    );
  });

  it('pages through every result and returns each event with its start time in query order', async () => {
    queryMock
      .mockResolvedValueOnce(
        buildPage({
          calendarEventNodes: [
            { id: 'calendar-event-2', startsAt: '2026-07-04T13:00:00.000Z' },
            { id: 'calendar-event-1', startsAt: '2026-07-04T14:00:00.000Z' },
          ],
          hasNextPage: true,
          endCursor: 'cursor-1',
        }),
      )
      .mockResolvedValueOnce(
        buildPage({
          calendarEventNodes: [{ id: 'calendar-event-3', startsAt: null }],
        }),
      );

    const upcomingCalendarEvents = await fetchUpcomingCalendarEvents(
      CLIENT,
      NOW,
    );

    expect(queryMock).toHaveBeenCalledTimes(2);
    expect(queryMock.mock.calls[1][0].calendarEvents.__args.after).toBe(
      'cursor-1',
    );
    expect(upcomingCalendarEvents).toEqual([
      { id: 'calendar-event-2', startsAt: '2026-07-04T13:00:00.000Z' },
      { id: 'calendar-event-1', startsAt: '2026-07-04T14:00:00.000Z' },
      { id: 'calendar-event-3', startsAt: undefined },
    ]);
  });

  it('returns an empty list when no upcoming events exist', async () => {
    queryMock.mockResolvedValue(buildPage({ calendarEventNodes: [] }));

    await expect(fetchUpcomingCalendarEvents(CLIENT, NOW)).resolves.toEqual([]);
  });
});
