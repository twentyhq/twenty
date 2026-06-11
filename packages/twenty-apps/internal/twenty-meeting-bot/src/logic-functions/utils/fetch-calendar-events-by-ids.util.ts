import { CoreApiClient } from 'twenty-client-sdk/core';

import { type CalendarEventRecord } from 'src/logic-functions/types/calendar-event-record.type';
import { fetchCalendarEventsByFilter } from 'src/logic-functions/utils/fetch-calendar-events-by-filter.util';
import { getUniqueSortedIds } from 'src/logic-functions/utils/get-unique-sorted-ids.util';

export const fetchCalendarEventsByIds = async (
  client: CoreApiClient,
  calendarEventIds: string[],
): Promise<CalendarEventRecord[]> => {
  const uniqueCalendarEventIds = getUniqueSortedIds(calendarEventIds);

  if (uniqueCalendarEventIds.length === 0) {
    return [];
  }

  return fetchCalendarEventsByFilter(client, {
    id: { in: uniqueCalendarEventIds },
  });
};
