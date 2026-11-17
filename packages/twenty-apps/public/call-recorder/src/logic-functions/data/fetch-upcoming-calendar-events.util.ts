import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { TWENTY_PAGE_SIZE } from 'src/logic-functions/constants/twenty-page-size';
import {
  fetchAllNodes,
  type ConnectionPage,
} from 'src/logic-functions/data/fetch-all-nodes.util';
import { computeUpcomingCalendarEventHorizonEnd } from 'src/logic-functions/domain/compute-upcoming-calendar-event-horizon-end.util';
import { type UpcomingCalendarEvent } from 'src/logic-functions/types/upcoming-calendar-event.type';

type UpcomingCalendarEventNode = {
  id: string;
  startsAt?: string | null;
};

export const fetchUpcomingCalendarEvents = async (
  client: CoreApiClient,
  now: Date,
): Promise<UpcomingCalendarEvent[]> => {
  const nowIsoString = now.toISOString();
  const horizonEndIsoString =
    computeUpcomingCalendarEventHorizonEnd(now).toISOString();

  const calendarEventNodes = await fetchAllNodes<UpcomingCalendarEventNode>(
    async (afterCursor) => {
      const queryResult = await client.query({
        calendarEvents: {
          __args: {
            filter: {
              isCanceled: { eq: false },
              // Mirror the policy: the horizon is measured from startsAt (the bot's join time),
              // while endsAt drives the not-past check so in-progress meetings still qualify.
              // Ranges use and-ed entries because the API applies one operator per field filter.
              or: [
                {
                  and: [
                    { startsAt: { lte: horizonEndIsoString } },
                    { endsAt: { gt: nowIsoString } },
                  ],
                },
                {
                  and: [
                    { endsAt: { is: 'NULL' } },
                    { startsAt: { gt: nowIsoString } },
                    { startsAt: { lte: horizonEndIsoString } },
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
              startsAt: true,
            },
          },
        },
      });

      return queryResult.calendarEvents as
        | ConnectionPage<UpcomingCalendarEventNode>
        | undefined;
    },
  );

  return calendarEventNodes.map((calendarEvent) => ({
    id: calendarEvent.id,
    startsAt: calendarEvent.startsAt ?? undefined,
  }));
};
