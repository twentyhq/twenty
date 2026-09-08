import { isDefined } from 'twenty-sdk/utils';

import { getUnambiguousCalendarEventId } from 'src/logic-functions/utils/get-unambiguous-calendar-event-id.util';

export type CalendarEventIdConnection = {
  pageInfo: { hasNextPage: boolean };
  edges: { node: { calendarEventId: string | null } }[];
};

export const getUnambiguousCalendarEventIdFromConnection = (
  connection: CalendarEventIdConnection | undefined,
): string | undefined =>
  isDefined(connection) && !connection.pageInfo.hasNextPage
    ? getUnambiguousCalendarEventId(
        connection.edges.map((edge) => edge.node.calendarEventId),
      )
    : undefined;
