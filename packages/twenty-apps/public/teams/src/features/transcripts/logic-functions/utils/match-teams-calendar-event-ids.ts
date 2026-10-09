import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { type CalendarChannelEventAssociation } from 'src/features/transcripts/logic-functions/types/calendar-channel-event-association.type';
import { type CalendarEvent } from 'src/features/transcripts/logic-functions/types/calendar-event.type';
import { type TeamsCalendarReference } from 'src/features/transcripts/logic-functions/types/teams-calendar-reference.type';

const groupCalendarEventIdsByKey = (
  entries: [string, string][],
): Map<string, Set<string>> => {
  const calendarEventIdsByKey = new Map<string, Set<string>>();

  for (const [key, calendarEventId] of entries) {
    calendarEventIdsByKey.set(
      key,
      (calendarEventIdsByKey.get(key) ?? new Set<string>()).add(
        calendarEventId,
      ),
    );
  }

  return calendarEventIdsByKey;
};

const findUniqueCalendarEventId = (
  calendarEventIds: Set<string> | undefined,
): string | undefined =>
  calendarEventIds?.size === 1 ? [...calendarEventIds][0] : undefined;

export const matchTeamsCalendarEventIds = ({
  references,
  calendarChannelEventAssociations,
  calendarEvents,
}: {
  references: TeamsCalendarReference[];
  calendarChannelEventAssociations: CalendarChannelEventAssociation[];
  calendarEvents: CalendarEvent[];
}): Map<string, string> => {
  const calendarEventIdsByEventExternalId = groupCalendarEventIdsByKey(
    calendarChannelEventAssociations.map(
      ({ eventExternalId, calendarEventId }): [string, string] => [
        eventExternalId,
        calendarEventId,
      ],
    ),
  );
  const calendarEventIdsByICalUid = groupCalendarEventIdsByKey(
    calendarEvents.flatMap(({ id, iCalUid }): [string, string][] =>
      isNonEmptyString(iCalUid) ? [[iCalUid, id]] : [],
    ),
  );

  return new Map(
    references.flatMap(({ eventExternalId, iCalUId }): [string, string][] => {
      const calendarEventId =
        findUniqueCalendarEventId(
          calendarEventIdsByEventExternalId.get(eventExternalId),
        ) ??
        (isDefined(iCalUId)
          ? findUniqueCalendarEventId(calendarEventIdsByICalUid.get(iCalUId))
          : undefined);

      return isDefined(calendarEventId)
        ? [[eventExternalId, calendarEventId]]
        : [];
    }),
  );
};
