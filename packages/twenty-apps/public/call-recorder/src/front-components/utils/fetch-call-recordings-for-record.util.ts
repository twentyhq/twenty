import { isNonEmptyString, isString, isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CALL_RECORDINGS_WIDGET_MAX_CALENDAR_EVENT_TARGET_PAGES } from 'src/front-components/constants/call-recordings-widget-max-calendar-event-target-pages.constant';
import { CALL_RECORDINGS_WIDGET_MAX_CALL_RECORDINGS_PER_BATCH } from 'src/front-components/constants/call-recordings-widget-max-call-recordings-per-batch.constant';
import { LISTED_CALL_RECORDING_STATUSES } from 'src/front-components/constants/listed-call-recording-statuses.constant';
import { type CalendarEventTargetFieldName } from 'src/front-components/types/calendar-event-target-field-name.type';
import { type CallRecordingNode } from 'src/front-components/types/call-recording-node.type';
import { getMostRecentCallRecordings } from 'src/front-components/utils/get-most-recent-call-recordings.util';
import { isPermissionDeniedError } from 'src/front-components/utils/is-permission-denied-error.util';
import { TWENTY_PAGE_SIZE } from 'src/logic-functions/constants/twenty-page-size';
import {
  fetchAllNodes,
  type ConnectionPage,
} from 'src/logic-functions/data/fetch-all-nodes.util';

type QueryClient = Pick<CoreApiClient, 'query'>;

type CalendarEventTargetNode = {
  id: string;
  calendarEventId?: string | null;
};

type CalendarEventTargetOrderBy = Array<Record<string, unknown>>;

const BY_MEETING_DATE_ORDER_BY: CalendarEventTargetOrderBy = [
  { calendarEvent: { startsAt: 'DescNullsLast' } },
];

const BY_TARGET_CREATION_ORDER_BY: CalendarEventTargetOrderBy = [
  { createdAt: 'DescNullsLast' },
];

const fetchCalendarEventTargetPage = async ({
  client,
  calendarEventTargetFieldName,
  recordId,
  orderBy,
  afterCursor,
}: {
  client: QueryClient;
  calendarEventTargetFieldName: CalendarEventTargetFieldName;
  recordId: string;
  orderBy: CalendarEventTargetOrderBy;
  afterCursor: string | undefined;
}): Promise<ConnectionPage<CalendarEventTargetNode>> => {
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

  if (isUndefined(connection)) {
    throw new Error('Pagination query returned no connection');
  }

  return connection;
};

const fetchListedCallRecordingsForCalendarEventIds = async ({
  client,
  calendarEventIds,
  isCalendarEventLoaded,
}: {
  client: QueryClient;
  calendarEventIds: string[];
  isCalendarEventLoaded: boolean;
}): Promise<CallRecordingNode[]> => {
  let fetchedCallRecordingCount = 0;

  return fetchAllNodes<CallRecordingNode>(
    async (afterCursor) => {
      const queryResult = await client.query({
        callRecordings: {
          __args: {
            filter: {
              calendarEventId: { in: calendarEventIds },
              status: { in: LISTED_CALL_RECORDING_STATUSES },
            },
            orderBy: [
              { startedAt: 'DescNullsFirst' },
              { createdAt: 'DescNullsLast' },
            ],
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
              title: true,
              status: true,
              startedAt: true,
              endedAt: true,
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

      fetchedCallRecordingCount += connection?.edges?.length ?? 0;

      return connection;
    },
    () =>
      fetchedCallRecordingCount <
      CALL_RECORDINGS_WIDGET_MAX_CALL_RECORDINGS_PER_BATCH,
  );
};

// A record's newest meetings are often upcoming ones without a recording yet.
export const fetchCallRecordingsForRecord = async ({
  client,
  calendarEventTargetFieldName,
  recordId,
  maxCount,
}: {
  client: QueryClient;
  calendarEventTargetFieldName: CalendarEventTargetFieldName;
  recordId: string;
  maxCount: number;
}): Promise<CallRecordingNode[]> => {
  const seenCalendarEventIds = new Set<string>();
  const callRecordings: CallRecordingNode[] = [];
  let orderBy = BY_MEETING_DATE_ORDER_BY;
  let isCalendarEventLoaded = true;
  let afterCursor: string | undefined;
  let hasNextPage = true;
  let fetchedPageCount = 0;

  const fetchTargetPage = () =>
    fetchCalendarEventTargetPage({
      client,
      calendarEventTargetFieldName,
      recordId,
      orderBy,
      afterCursor,
    });

  const fetchRecordings = (calendarEventIds: string[]) =>
    fetchListedCallRecordingsForCalendarEventIds({
      client,
      calendarEventIds,
      isCalendarEventLoaded,
    });

  // Target creation order is not meeting order, so the fallback reads every page.
  const hasEnoughCallRecordings = () =>
    orderBy === BY_MEETING_DATE_ORDER_BY && callRecordings.length >= maxCount;

  while (
    hasNextPage &&
    !hasEnoughCallRecordings() &&
    fetchedPageCount < CALL_RECORDINGS_WIDGET_MAX_CALENDAR_EVENT_TARGET_PAGES
  ) {
    let targetPage: ConnectionPage<CalendarEventTargetNode>;

    try {
      targetPage = await fetchTargetPage();
    } catch (error) {
      if (fetchedPageCount > 0 || !isPermissionDeniedError(error)) {
        throw error;
      }

      // Ordering through the meeting needs read access to it.
      orderBy = BY_TARGET_CREATION_ORDER_BY;
      isCalendarEventLoaded = false;
      targetPage = await fetchTargetPage();
    }

    fetchedPageCount += 1;

    const newCalendarEventIds = [
      ...new Set(
        (targetPage.edges ?? [])
          .map((edge) => edge.node.calendarEventId)
          .filter(isNonEmptyString)
          .filter(
            (calendarEventId) => !seenCalendarEventIds.has(calendarEventId),
          ),
      ),
    ];

    newCalendarEventIds.forEach((calendarEventId) =>
      seenCalendarEventIds.add(calendarEventId),
    );

    if (newCalendarEventIds.length > 0) {
      try {
        callRecordings.push(...(await fetchRecordings(newCalendarEventIds)));
      } catch (error) {
        if (!isCalendarEventLoaded || !isPermissionDeniedError(error)) {
          throw error;
        }

        isCalendarEventLoaded = false;
        callRecordings.push(...(await fetchRecordings(newCalendarEventIds)));
      }
    }

    const endCursor = targetPage.pageInfo?.endCursor;

    hasNextPage =
      (targetPage.pageInfo?.hasNextPage ?? false) && isString(endCursor);
    afterCursor = isString(endCursor) ? endCursor : undefined;
  }

  return getMostRecentCallRecordings({ callRecordings, maxCount });
};
