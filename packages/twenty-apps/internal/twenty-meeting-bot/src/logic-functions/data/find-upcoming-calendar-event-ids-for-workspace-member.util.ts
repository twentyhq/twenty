import { isUndefined } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { TWENTY_PAGE_SIZE } from 'src/logic-functions/constants/twenty-page-size';
import {
  fetchAllNodes,
  type ConnectionPage,
} from 'src/logic-functions/data/fetch-all-nodes.util';
import { fetchCalendarChannelEventAssociations } from 'src/logic-functions/data/fetch-calendar-channel-event-associations.util';
import { fetchCalendarChannelOwners } from 'src/logic-functions/data/fetch-calendar-channel-owners.util';
import { getUniqueSortedIds } from 'src/logic-functions/utils/get-unique-sorted-ids.util';

const UPCOMING_CALENDAR_EVENT_LOOKBACK_HOURS = 4;

type CalendarEventIdNode = {
  id: string;
};

export const findUpcomingCalendarEventIdsForWorkspaceMember = async ({
  client,
  workspaceMemberId,
  now,
}: {
  client: CoreApiClient;
  workspaceMemberId: string;
  now: Date;
}): Promise<string[]> => {
  const channelOwners = await fetchCalendarChannelOwners();
  // Ownerless channels are included so a deleted member's events still reconcile.
  const memberCalendarChannelIds = getUniqueSortedIds(
    channelOwners
      .filter(
        (channelOwner) =>
          channelOwner.workspaceMemberId === workspaceMemberId ||
          isUndefined(channelOwner.workspaceMemberId),
      )
      .map((channelOwner) => channelOwner.calendarChannelId),
  );

  if (memberCalendarChannelIds.length === 0) {
    return [];
  }

  const associations = await fetchCalendarChannelEventAssociations(client, {
    calendarChannelId: { in: memberCalendarChannelIds },
  });
  const calendarEventIds = getUniqueSortedIds(
    associations.map((association) => association.calendarEventId),
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
  const calendarEventNodes = await fetchAllNodes<CalendarEventIdNode>(
    async (afterCursor) => {
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

      return queryResult.calendarEvents as
        | ConnectionPage<CalendarEventIdNode>
        | undefined;
    },
  );

  return getUniqueSortedIds(
    calendarEventNodes.map((calendarEvent) => calendarEvent.id),
  );
};
