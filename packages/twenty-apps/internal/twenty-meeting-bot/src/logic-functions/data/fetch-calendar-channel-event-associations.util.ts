import { isString, isUndefined } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { TWENTY_PAGE_SIZE } from 'src/logic-functions/constants/twenty-page-size';
import { fetchAllNodes } from 'src/logic-functions/data/fetch-all-nodes.util';

export type CalendarChannelEventAssociationRecord = {
  id: string;
  calendarEventId: string | undefined;
  calendarChannelId: string | undefined;
};

export const fetchCalendarChannelEventAssociations = async (
  client: CoreApiClient,
  filter: Record<string, unknown>,
): Promise<CalendarChannelEventAssociationRecord[]> => {
  const associationNodes = await fetchAllNodes(async (afterCursor) => {
    const queryResult = await client.query({
      calendarChannelEventAssociations: {
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
            calendarEventId: true,
            calendarChannelId: true,
          },
        },
      },
    });

    return queryResult.calendarChannelEventAssociations;
  });

  return associationNodes.map((associationNode) => ({
    id: associationNode.id,
    calendarEventId: isString(associationNode.calendarEventId)
      ? associationNode.calendarEventId
      : undefined,
    calendarChannelId: isString(associationNode.calendarChannelId)
      ? associationNode.calendarChannelId
      : undefined,
  }));
};
