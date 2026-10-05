import { type CoreApiClient } from 'twenty-client-sdk/core';

import { executeWithRetry } from 'src/utils/execute-with-retry';

const PAGE_SIZE = 200;

export type CalendarEventStart = { id: string; startsAt: string };

export const collectCalendarEventStarts = async (
  client: CoreApiClient,
  { from, to }: { from: Date; to: Date },
): Promise<CalendarEventStart[]> => {
  const calendarEventStarts: CalendarEventStart[] = [];
  let after: string | undefined;

  do {
    const { calendarEvents } = await executeWithRetry(() =>
      client.query({
        calendarEvents: {
          __args: {
            filter: {
              and: [
                { startsAt: { gte: from.toISOString() } },
                { startsAt: { lt: to.toISOString() } },
                { isCanceled: { eq: false } },
              ],
            },
            first: PAGE_SIZE,
            after,
          },
          edges: { node: { id: true, startsAt: true } },
          pageInfo: { hasNextPage: true, endCursor: true },
        },
      }),
    );

    for (const edge of calendarEvents?.edges ?? []) {
      const { id, startsAt } = edge.node;

      if (id && startsAt) {
        calendarEventStarts.push({ id, startsAt });
      }
    }

    after = calendarEvents?.pageInfo.hasNextPage
      ? (calendarEvents.pageInfo.endCursor ?? undefined)
      : undefined;
  } while (after);

  return calendarEventStarts;
};
