import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { TWENTY_PAGE_SIZE } from 'src/logic-functions/constants/twenty-page-size';
import {
  fetchAllNodes,
  type ConnectionPage,
} from 'src/logic-functions/data/fetch-all-nodes.util';

type CallRecordingIdNode = {
  id: string;
};

export const findCallRecordingIdsForCalendarEvents = async (
  client: CoreApiClient,
  { calendarEventIds }: { calendarEventIds: string[] },
): Promise<string[]> => {
  if (calendarEventIds.length === 0) {
    return [];
  }

  const callRecordingNodes = await fetchAllNodes<CallRecordingIdNode>(
    async (afterCursor) => {
      const queryResult = await client.query({
        callRecordings: {
          __args: {
            filter: {
              calendarEventId: { in: calendarEventIds },
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

      return queryResult.callRecordings as
        | ConnectionPage<CallRecordingIdNode>
        | undefined;
    },
  );

  return callRecordingNodes.map((callRecording) => callRecording.id);
};
