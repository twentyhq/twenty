import { CoreApiClient } from 'twenty-client-sdk/core';

import { type CalendarEventRecord } from 'src/logic-functions/types/calendar-event-record.type';
import { fetchCalendarEventsByFilter } from 'src/logic-functions/data/fetch-calendar-events-by-filter.util';

export const fetchCalendarEventsByStartsAtValues = async (
  client: CoreApiClient,
  startsAtValues: string[],
): Promise<CalendarEventRecord[]> => {
  const uniqueStartsAtValues = [...new Set(startsAtValues)].sort();

  if (uniqueStartsAtValues.length === 0) {
    return [];
  }

  return fetchCalendarEventsByFilter(client, {
    startsAt: { in: uniqueStartsAtValues },
  });
};
