import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecorderPreference } from 'src/constants/call-recorder-preference';
import { TWENTY_PAGE_SIZE } from 'src/logic-functions/constants/twenty-page-size';
import {
  fetchAllNodes,
  type ConnectionPage,
} from 'src/logic-functions/data/fetch-all-nodes.util';
import { getUniqueSortedIds } from 'src/logic-functions/utils/get-unique-sorted-ids.util';

type CalendarEventIdNode = {
  id: string;
};

export const fetchEndedCalendarEventIdsWithDefaultPreference = async (
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
              callRecorderPreference: { eq: CallRecorderPreference.ON },
              // Mirrors hasMeetingEnded: endsAt decides, startsAt is the fallback.
              or: [
                { endsAt: { lte: nowIsoString } },
                {
                  and: [
                    { endsAt: { is: 'NULL' } },
                    { startsAt: { lte: nowIsoString } },
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
