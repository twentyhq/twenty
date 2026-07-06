import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { TWENTY_PAGE_SIZE } from 'src/logic-functions/constants/twenty-page-size';
import { UPCOMING_CALENDAR_EVENT_MAX_FUTURE_YEARS } from 'src/logic-functions/constants/upcoming-calendar-event-max-future-years';
import {
  fetchAllNodes,
  type ConnectionPage,
} from 'src/logic-functions/data/fetch-all-nodes.util';
import { getUniqueSortedIds } from 'src/logic-functions/utils/get-unique-sorted-ids.util';

type CalendarEventIdNode = {
  id: string;
};

export const fetchUpcomingCalendarEventIds = async (
  client: CoreApiClient,
  now: Date,
): Promise<string[]> => {
  const nowIsoString = now.toISOString();
  const maxFutureDate = new Date(now);
  maxFutureDate.setFullYear(
    maxFutureDate.getFullYear() + UPCOMING_CALENDAR_EVENT_MAX_FUTURE_YEARS,
  );
  const maxFutureIsoString = maxFutureDate.toISOString();

  const calendarEventNodes = await fetchAllNodes<CalendarEventIdNode>(
    async (afterCursor) => {
      const queryResult = await client.query({
        calendarEvents: {
          __args: {
            filter: {
              isCanceled: { eq: false },
              // Must match the policy's upcoming rule: endsAt, falling back to startsAt.
              // Ranges use and-ed entries because the API applies one operator per field filter.
              or: [
                {
                  and: [
                    { endsAt: { gt: nowIsoString } },
                    { endsAt: { lte: maxFutureIsoString } },
                  ],
                },
                {
                  and: [
                    { endsAt: { is: 'NULL' } },
                    { startsAt: { gt: nowIsoString } },
                    { startsAt: { lte: maxFutureIsoString } },
                  ],
                },
              ],
            },
            orderBy: [{ startsAt: 'AscNullsLast' }],
            first: TWENTY_PAGE_SIZE,
            ...(isUndefined(afterCursor) ? {} : { after: afterCursor }),
          },
          pageInfo: {
            hasNextPage: true,
            endCursor: true,
          },
          edges: {
            node: {
              id: true,
            },
          },
        },
      });

      return queryResult.calendarEvents as
        | ConnectionPage<CalendarEventIdNode>
        | undefined;
    },
  );

  return getUniqueSortedIds(
    calendarEventNodes.map((calendarEvent) => calendarEvent.id),
  );
};
