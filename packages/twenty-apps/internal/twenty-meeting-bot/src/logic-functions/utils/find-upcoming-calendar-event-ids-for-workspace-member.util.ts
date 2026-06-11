import { isUndefined } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { TWENTY_PAGE_SIZE } from 'src/logic-functions/constants/twenty-page-size';
import { fetchAllNodes } from 'src/logic-functions/utils/fetch-all-nodes.util';
import { getUniqueSortedIds } from 'src/logic-functions/utils/get-unique-sorted-ids.util';

const UPCOMING_CALENDAR_EVENT_LOOKBACK_HOURS = 4;

export const findUpcomingCalendarEventIdsForWorkspaceMember = async ({
  client,
  workspaceMemberId,
  now,
}: {
  client: CoreApiClient;
  workspaceMemberId: string;
  now: Date;
}): Promise<string[]> => {
  const participantNodes = await fetchAllNodes(async (afterCursor) => {
    const queryResult = await client.query({
      calendarEventParticipants: {
        __args: {
          filter: {
            workspaceMemberId: { eq: workspaceMemberId },
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
            calendarEventId: true,
          },
        },
      },
    });

    return queryResult.calendarEventParticipants;
  });

  const calendarEventIds = getUniqueSortedIds(
    participantNodes.map((participant) => participant.calendarEventId),
  );

  if (calendarEventIds.length === 0) {
    return [];
  }

  const lowerBound = new Date(
    now.getTime() - UPCOMING_CALENDAR_EVENT_LOOKBACK_HOURS * 60 * 60 * 1000,
  ).toISOString();
  const filter: Record<string, unknown> = {
    id: { in: calendarEventIds },
    startsAt: { gte: lowerBound },
  };
  const calendarEventNodes = await fetchAllNodes(async (afterCursor) => {
    const queryResult = await client.query({
      calendarEvents: {
        __args: {
          filter,
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

    return queryResult.calendarEvents;
  });

  return getUniqueSortedIds(
    calendarEventNodes.map((calendarEvent) => calendarEvent.id),
  );
};
