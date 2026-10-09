import { isNonEmptyString, isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CALL_RECORDINGS_WIDGET_MAX_CALENDAR_EVENT_TARGETS } from 'src/front-components/constants/call-recordings-widget-max-calendar-event-targets.constant';
import { type CalendarEventTargetFieldName } from 'src/front-components/types/calendar-event-target-field-name.type';
import { type CallRecordingNode } from 'src/front-components/types/call-recording-node.type';
import { getMostRecentCallRecordings } from 'src/front-components/utils/get-most-recent-call-recordings.util';
import { TWENTY_PAGE_SIZE } from 'src/logic-functions/constants/twenty-page-size';
import {
  fetchAllNodes,
  type ConnectionPage,
} from 'src/logic-functions/data/fetch-all-nodes.util';
import { getBatches } from 'src/logic-functions/utils/get-batches.util';

type CalendarEventTargetNode = {
  id: string;
  calendarEventId?: string | null;
};

const fetchCalendarEventIdsForRecord = async (
  client: CoreApiClient,
  {
    calendarEventTargetFieldName,
    recordId,
  }: {
    calendarEventTargetFieldName: CalendarEventTargetFieldName;
    recordId: string;
  },
): Promise<string[]> => {
  let fetchedCalendarEventTargetCount = 0;

  const calendarEventTargets = await fetchAllNodes<CalendarEventTargetNode>(
    async (afterCursor) => {
      const queryResult = await client.query({
        calendarEventTargets: {
          __args: {
            filter: { [calendarEventTargetFieldName]: { eq: recordId } },
            orderBy: [{ createdAt: 'DescNullsLast' }],
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

      const connection = queryResult.calendarEventTargets as
        | ConnectionPage<CalendarEventTargetNode>
        | undefined;

      fetchedCalendarEventTargetCount += connection?.edges?.length ?? 0;

      return connection;
    },
    () =>
      fetchedCalendarEventTargetCount <
      CALL_RECORDINGS_WIDGET_MAX_CALENDAR_EVENT_TARGETS,
  );

  return [
    ...new Set(
      calendarEventTargets
        .map((calendarEventTarget) => calendarEventTarget.calendarEventId)
        .filter(isNonEmptyString),
    ),
  ];
};

const fetchMostRecentCallRecordingsForCalendarEventIds = async (
  client: CoreApiClient,
  {
    calendarEventIds,
    maxCount,
  }: {
    calendarEventIds: string[];
    maxCount: number;
  },
): Promise<CallRecordingNode[]> => {
  const queryResult = await client.query({
    callRecordings: {
      __args: {
        filter: { calendarEventId: { in: calendarEventIds } },
        orderBy: [
          { startedAt: 'DescNullsLast' },
          { createdAt: 'DescNullsLast' },
        ],
        first: maxCount,
      },
      edges: {
        node: {
          id: true,
          title: true,
          startedAt: true,
          createdAt: true,
          calendarEventId: true,
          calendarEvent: {
            id: true,
            title: true,
            startsAt: true,
          },
        },
      },
    },
  });

  const connection = queryResult.callRecordings as
    | ConnectionPage<CallRecordingNode>
    | undefined;

  return (connection?.edges ?? []).map((edge) => edge.node);
};

export const fetchCallRecordingsForRecord = async (
  client: CoreApiClient,
  {
    calendarEventTargetFieldName,
    recordId,
    maxCount,
  }: {
    calendarEventTargetFieldName: CalendarEventTargetFieldName;
    recordId: string;
    maxCount: number;
  },
): Promise<CallRecordingNode[]> => {
  const calendarEventIds = await fetchCalendarEventIdsForRecord(client, {
    calendarEventTargetFieldName,
    recordId,
  });

  const callRecordings: CallRecordingNode[] = [];

  // Each batch returns its own most recent recordings; the overall most recent
  // ones are always among them, so merging and capping again is exact.
  for (const calendarEventIdBatch of getBatches(
    calendarEventIds,
    TWENTY_PAGE_SIZE,
  )) {
    callRecordings.push(
      ...(await fetchMostRecentCallRecordingsForCalendarEventIds(client, {
        calendarEventIds: calendarEventIdBatch,
        maxCount,
      })),
    );
  }

  return getMostRecentCallRecordings({ callRecordings, maxCount });
};
