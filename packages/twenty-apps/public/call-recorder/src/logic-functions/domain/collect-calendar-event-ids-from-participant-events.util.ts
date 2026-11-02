import { type ObjectRecordBaseEvent } from 'twenty-sdk/define';

import { type CalendarEventParticipantForDatabaseEvent } from 'src/logic-functions/types/calendar-event-participant-for-database-event.type';
import { getUniqueSortedIds } from 'src/logic-functions/utils/get-unique-sorted-ids.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

// Only attendees matched to a workspace member can change the policy, so external ones, most of the sync traffic, are skipped.
export const collectCalendarEventIdsFromParticipantEvents = (
  events: ObjectRecordBaseEvent<CalendarEventParticipantForDatabaseEvent>[],
): string[] =>
  getUniqueSortedIds(
    events.flatMap((event) => {
      const { before, after } = event.properties;

      if (
        !isNonEmptyString(before?.workspaceMemberId) &&
        !isNonEmptyString(after?.workspaceMemberId)
      ) {
        return [];
      }

      return [before?.calendarEventId, after?.calendarEventId].filter(
        isNonEmptyString,
      );
    }),
  );
