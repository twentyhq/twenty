import { type ObjectRecordBaseEvent } from 'twenty-sdk/define';

import { type CalendarEventParticipantForDatabaseEvent } from 'src/logic-functions/types/calendar-event-participant-for-database-event.type';
import { getUniqueSortedIds } from 'src/logic-functions/utils/get-unique-sorted-ids.util';

export const getCalendarEventIdsFromParticipantEvents = (
  events: ObjectRecordBaseEvent<CalendarEventParticipantForDatabaseEvent>[],
): string[] =>
  getUniqueSortedIds(
    events.flatMap((event) => [
      event.properties.before?.calendarEventId,
      event.properties.after?.calendarEventId,
    ]),
  );
