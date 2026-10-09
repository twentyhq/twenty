import { isNonEmptyString, isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CALL_RECORDINGS_WIDGET_MAX_CALENDAR_EVENT_TARGETS } from 'src/front-components/constants/call-recordings-widget-max-calendar-event-targets.constant';
import { LISTED_CALL_RECORDING_STATUSES } from 'src/front-components/constants/listed-call-recording-statuses.constant';
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

const BY_MEETING_DATE_ORDER_BY = [
  { calendarEvent: { startsAt: 'DescNullsLast' } },
];

const BY_TARGET_CREATION_ORDER_BY = [{ createdAt: 'DescNullsLast' }];

const fetchCalendarEventIdsForRecord = async (
  client: CoreApiClient,
  {
    calendarEventTargetFieldName,
    recordId,
    orderBy,
  }: {
    calendarEventTargetFieldName: CalendarEventTargetFieldName;
    recordId: string;
    orderBy: Array<Record<string, unknown>>;
  },
): Promise<string[]> => {
  let fetchedCalendarEventTargetCount = 0;

  const calendarEventTargets = await fetchAllNodes<CalendarEventTargetNode>(
    async (afterCursor) => {
      const queryResult = await client.query({
        calendarEventTargets: {
          __args: {
            filter: { [calendarEventTargetFieldName]: { eq: recordId } },
            orderBy,
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

const fetchCalendarEventIdsByMeetingDate = async (
  client: CoreApiClient,
  params: {
    calendarEventTargetFieldName: CalendarEventTargetFieldName;
    recordId: string;
  },
): Promise<string[]> => {
  try {
    return await fetchCalendarEventIdsForRecord(client, {
      ...params,
      orderBy: BY_MEETING_DATE_ORDER_BY,
    });
  } catch {
    // Ordering through the meeting needs read access to it; without it, fall
    // back to target creation order, which only roughly follows meeting dates.
    return fetchCalendarEventIdsForRecord(client, {
      ...params,
      orderBy: BY_TARGET_CREATION_ORDER_BY,
    });
  }
};

const fetchMostRecentCallRecordingsForCalendarEventIds = async (
  client: CoreApiClient,
  {
    calendarEventIds,
    maxCount,
    isCalendarEventLoaded,
  }: {
    calendarEventIds: string[];
    maxCount: number;
    isCalendarEventLoaded: boolean;
  },
): Promise<CallRecordingNode[]> => {
  const queryResult = await client.query({
    callRecordings: {
      __args: {
        filter: {
          calendarEventId: { in: calendarEventIds },
          status: { in: LISTED_CALL_RECORDING_STATUSES },
        },
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
          ...(isCalendarEventLoaded
            ? { calendarEvent: { id: true, title: true, startsAt: true } }
            : {}),
        },
      },
    },
  });

  const connection = queryResult.callRecordings as
    | ConnectionPage<CallRecordingNode>
    | undefined;

  return (connection?.edges ?? []).map((edge) => edge.node);
};

const fetchMostRecentCallRecordings = async (
  client: CoreApiClient,
  {
    calendarEventIds,
    maxCount,
    isCalendarEventLoaded,
  }: {
    calendarEventIds: string[];
    maxCount: number;
    isCalendarEventLoaded: boolean;
  },
): Promise<CallRecordingNode[]> => {
  const callRecordings: CallRecordingNode[] = [];

  // Listed recordings have started, so startedAt is normally set and the
  // server order matches the displayed date: each batch's top results then
  // hold the overall top, which the final sort and cap pick out.
  for (const calendarEventIdBatch of getBatches(
    calendarEventIds,
    TWENTY_PAGE_SIZE,
  )) {
    callRecordings.push(
      ...(await fetchMostRecentCallRecordingsForCalendarEventIds(client, {
        calendarEventIds: calendarEventIdBatch,
        maxCount,
        isCalendarEventLoaded,
      })),
    );
  }

  return getMostRecentCallRecordings({ callRecordings, maxCount });
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
  const calendarEventIds = await fetchCalendarEventIdsByMeetingDate(client, {
    calendarEventTargetFieldName,
    recordId,
  });

  if (calendarEventIds.length === 0) {
    return [];
  }

  try {
    return await fetchMostRecentCallRecordings(client, {
      calendarEventIds,
      maxCount,
      isCalendarEventLoaded: true,
    });
  } catch {
    // A viewer who cannot read calendar events fails the whole query; the
    // recordings still list without the meeting title fallback.
    return fetchMostRecentCallRecordings(client, {
      calendarEventIds,
      maxCount,
      isCalendarEventLoaded: false,
    });
  }
};
