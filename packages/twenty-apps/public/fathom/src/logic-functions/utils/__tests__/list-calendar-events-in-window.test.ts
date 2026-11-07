import { describe, expect, it, vi } from 'vitest';

import { listCalendarEventsInWindow } from 'src/logic-functions/utils/list-calendar-events-in-window.util';

describe('listCalendarEventsInWindow', () => {
  it.each([null, undefined])(
    'rejects an incomplete candidate with startsAt %s',
    async (startsAt) => {
      const query = vi.fn().mockResolvedValue({
        calendarEvents: {
          edges: [{ node: { id: 'event', startsAt } }],
          pageInfo: { hasNextPage: false },
        },
      });

      await expect(
        listCalendarEventsInWindow({
          coreApiClient: { query },
          earliestStart: '2026-01-01T00:00:00Z',
          latestStart: '2026-01-02T00:00:00Z',
        }),
      ).resolves.toBeUndefined();
    },
  );

  it('keeps a dated event without a conference link', async () => {
    const startsAt = '2026-01-01T12:00:00Z';
    const query = vi.fn().mockResolvedValue({
      calendarEvents: {
        edges: [{ node: { id: 'event', startsAt } }],
        pageInfo: { hasNextPage: false },
      },
    });

    await expect(
      listCalendarEventsInWindow({
        coreApiClient: { query },
        earliestStart: '2026-01-01T00:00:00Z',
        latestStart: '2026-01-02T00:00:00Z',
      }),
    ).resolves.toEqual([{ id: 'event', startsAt, conferenceLink: null }]);
  });
});
