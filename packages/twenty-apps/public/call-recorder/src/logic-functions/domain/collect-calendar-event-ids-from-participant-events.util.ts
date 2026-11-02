import { type ObjectRecordBaseEvent } from 'twenty-sdk/define';

import { type CalendarEventParticipantForDatabaseEvent } from 'src/logic-functions/types/calendar-event-participant-for-database-event.type';
import { getUniqueSortedIds } from 'src/logic-functions/utils/get-unique-sorted-ids.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

export const collectCalendarEventIdsFromParticipantEvents = (
  events: ObjectRecordBaseEvent<CalendarEventParticipantForDatabaseEvent>[],
): string[] =>
  getUniqueSortedIds(
    events.flatMap(({ properties: { before, after } }) =>
      [before?.calendarEventId, after?.calendarEventId].filter(
        isNonEmptyString,
      ),
    ),
  );
