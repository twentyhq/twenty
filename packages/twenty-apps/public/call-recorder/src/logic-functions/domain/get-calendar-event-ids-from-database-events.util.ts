import { type ObjectRecordBaseEvent } from 'twenty-sdk/define';

import { getUniqueSortedIds } from 'src/logic-functions/utils/get-unique-sorted-ids.util';

export const getCalendarEventIdsFromDatabaseEvents = (
  events: Pick<
    ObjectRecordBaseEvent<{ calendarEventId?: string | null }>,
    'properties'
  >[],
): string[] =>
  getUniqueSortedIds(
    events.flatMap((event) => [
      event.properties.before?.calendarEventId,
      event.properties.after?.calendarEventId,
    ]),
  );
