import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { TWENTY_PAGE_SIZE } from 'src/logic-functions/constants/twenty-page-size';
import {
  fetchAllNodes,
  type ConnectionPage,
} from 'src/logic-functions/data/fetch-all-nodes.util';
import { getBatches } from 'src/logic-functions/utils/get-batches.util';

const CALENDAR_EVENT_ID_BATCH_SIZE = TWENTY_PAGE_SIZE;

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

  const callRecordingIds: string[] = [];

  for (const calendarEventIdBatch of getBatches(
    [...new Set(calendarEventIds)],
    CALENDAR_EVENT_ID_BATCH_SIZE,
  )) {
    const callRecordingNodes = await fetchAllNodes<CallRecordingIdNode>(
      async (afterCursor) => {
        const queryResult = await client.query({
          callRecordings: {
            __args: {
              filter: {
                calendarEventId: { in: calendarEventIdBatch },
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

    for (const callRecordingNode of callRecordingNodes) {
      callRecordingIds.push(callRecordingNode.id);
    }
  }

  return [...new Set(callRecordingIds)];
};
