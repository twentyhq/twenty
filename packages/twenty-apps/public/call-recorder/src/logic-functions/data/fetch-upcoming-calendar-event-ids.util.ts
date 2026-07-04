import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { TWENTY_PAGE_SIZE } from 'src/logic-functions/constants/twenty-page-size';
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

  const calendarEventNodes = await fetchAllNodes<CalendarEventIdNode>(
    async (afterCursor) => {
      const queryResult = await client.query({
        calendarEvents: {
          __args: {
            filter: {
              isCanceled: { eq: false },
              // Must match the policy's upcoming rule: endsAt, falling back to startsAt.
              or: [
                { endsAt: { gt: nowIsoString } },
                { endsAt: { is: 'NULL' }, startsAt: { gt: nowIsoString } },
              ],
            },
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
