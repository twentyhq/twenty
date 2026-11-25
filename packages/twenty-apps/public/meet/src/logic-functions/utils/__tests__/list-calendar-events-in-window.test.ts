import { type CoreApiClient } from 'twenty-client-sdk/core';
import { describe, expect, it, vi } from 'vitest';

import { MAX_CALENDAR_EVENT_PAGES } from 'src/logic-functions/constants/calendar-event-matching.constant';
import { listCalendarEventsInWindow } from 'src/logic-functions/utils/list-calendar-events-in-window.util';

const buildPage = ({
  ids,
  endCursor,
}: {
  ids: string[];
  endCursor?: string | null;
}) => ({
  calendarEvents: {
    edges: ids.map((id) => ({
      node: {
        id,
        title: null,
        startsAt: '2026-11-17T09:00:00.000Z',
        conferenceLink: null,
      },
    })),
    pageInfo: { hasNextPage: endCursor !== undefined, endCursor },
  },
});

const listCalendarEvents = (query: CoreApiClient['query']) =>
  listCalendarEventsInWindow({
    coreApiClient: { query },
    earliestStart: '2026-11-17T08:00:00.000Z',
    latestStart: '2026-11-17T10:00:00.000Z',
    conferenceLinkFragment: 'abc_mnop',
  });

describe('listCalendarEventsInWindow', () => {
  it('should list the events of every page', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce(buildPage({ ids: ['first'], endCursor: 'next' }))
      .mockResolvedValueOnce(buildPage({ ids: ['second'] }));

    const calendarEvents = await listCalendarEvents(query);

    expect(calendarEvents?.map(({ id }) => id)).toEqual(['first', 'second']);
    expect(query).toHaveBeenCalledTimes(2);
    expect(query.mock.calls[0][0].calendarEvents.__args).toEqual({
      filter: {
        and: [
          { startsAt: { gte: '2026-11-17T08:00:00.000Z' } },
          { startsAt: { lte: '2026-11-17T10:00:00.000Z' } },
          { isCanceled: { eq: false } },
          { conferenceLink: { primaryLinkUrl: { ilike: '%abc\\_mnop%' } } },
        ],
      },
      first: 200,
    });
    expect(query.mock.calls[1][0].calendarEvents.__args.after).toBe('next');
  });

  it('should give no list when the window has more pages than the limit', async () => {
    const query = vi
      .fn()
      .mockResolvedValue(buildPage({ ids: ['first'], endCursor: 'next' }));

    await expect(listCalendarEvents(query)).resolves.toBeUndefined();
    expect(query).toHaveBeenCalledTimes(MAX_CALENDAR_EVENT_PAGES);
  });

  it('should give no list when a following page has no cursor', async () => {
    const query = vi
      .fn()
      .mockResolvedValue(buildPage({ ids: ['first'], endCursor: null }));

    await expect(listCalendarEvents(query)).resolves.toBeUndefined();
    expect(query).toHaveBeenCalledTimes(1);
  });
});
