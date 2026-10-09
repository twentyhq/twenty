import { isNonEmptyString, isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CALL_RECORDINGS_WIDGET_MAX_CALENDAR_EVENT_TARGETS } from 'src/front-components/constants/call-recordings-widget-max-calendar-event-targets.constant';
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
import { getBatches } from 'src/logic-functions/utils/get-batches.util';

type CalendarEventTargetNode = {
  id: string;
  calendarEventId?: string | null;
};

type CalendarEventIdsForRecord = {
  calendarEventIds: string[];
  isCalendarEventReadable: boolean;
};

const BY_MEETING_DATE_ORDER_BY = [
  { calendarEvent: { startsAt: 'DescNullsLast' } },
];

const BY_TARGET_CREATION_ORDER_BY = [{ createdAt: 'DescNullsLast' }];

const fetchCalendarEventIds = async (
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

const fetchCalendarEventIdsForRecord = async (
  client: CoreApiClient,
  params: {
    calendarEventTargetFieldName: CalendarEventTargetFieldName;
    recordId: string;
  },
): Promise<CalendarEventIdsForRecord> => {
  try {
    return {
      calendarEventIds: await fetchCalendarEventIds(client, {
        ...params,
        orderBy: BY_MEETING_DATE_ORDER_BY,
      }),
      isCalendarEventReadable: true,
    };
  } catch (error) {
    if (!isPermissionDeniedError(error)) {
      throw error;
    }

    // Ordering through the meeting needs read access to it; without it, fall
    // back to target creation order, which only roughly follows meeting dates.
    return {
      calendarEventIds: await fetchCalendarEventIds(client, {
        ...params,
        orderBy: BY_TARGET_CREATION_ORDER_BY,
      }),
      isCalendarEventReadable: false,
    };
  }
};

const fetchListedCallRecordingsForCalendarEventIds = async (
  client: CoreApiClient,
  {
    calendarEventIds,
    isCalendarEventLoaded,
  }: {
    calendarEventIds: string[];
    isCalendarEventLoaded: boolean;
  },
): Promise<CallRecordingNode[]> => {
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

      fetchedCallRecordingCount += connection?.edges?.length ?? 0;

      return connection;
    },
    () =>
      fetchedCallRecordingCount <
      CALL_RECORDINGS_WIDGET_MAX_CALL_RECORDINGS_PER_BATCH,
  );
};

const fetchListedCallRecordings = async (
  client: CoreApiClient,
  {
    calendarEventIds,
    isCalendarEventLoaded,
  }: {
    calendarEventIds: string[];
    isCalendarEventLoaded: boolean;
  },
): Promise<CallRecordingNode[]> => {
  const callRecordingBatches = await Promise.all(
    getBatches(calendarEventIds, TWENTY_PAGE_SIZE).map((calendarEventIdBatch) =>
      fetchListedCallRecordingsForCalendarEventIds(client, {
        calendarEventIds: calendarEventIdBatch,
        isCalendarEventLoaded,
      }),
    ),
  );

  return callRecordingBatches.flat();
};

// Every listed recording of the record's meetings is fetched, then sorted and
// capped client-side by the date the widget shows; a server-side cap would
// order by startedAt and could drop a live call that has none yet.
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
  const { calendarEventIds, isCalendarEventReadable } =
    await fetchCalendarEventIdsForRecord(client, {
      calendarEventTargetFieldName,
      recordId,
    });

  if (calendarEventIds.length === 0) {
    return [];
  }

  const fetchMostRecentCallRecordings = async (
    isCalendarEventLoaded: boolean,
  ) =>
    getMostRecentCallRecordings({
      callRecordings: await fetchListedCallRecordings(client, {
        calendarEventIds,
        isCalendarEventLoaded,
      }),
      maxCount,
    });

  if (!isCalendarEventReadable) {
    return fetchMostRecentCallRecordings(false);
  }

  try {
    return await fetchMostRecentCallRecordings(true);
  } catch (error) {
    if (!isPermissionDeniedError(error)) {
      throw error;
    }

    // A viewer who cannot read calendar events fails the whole query; the
    // recordings still list without the meeting title fallback.
    return fetchMostRecentCallRecordings(false);
  }
};
