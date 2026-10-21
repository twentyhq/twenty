import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { type TeamsCalendarEvent } from 'src/features/transcripts/logic-functions/types/teams-calendar-event.type';
import { type TeamsMeetingOccurrence } from 'src/features/transcripts/logic-functions/types/teams-meeting-occurrence.type';
import { parseGraphUtcDateTime } from 'src/features/transcripts/logic-functions/utils/parse-graph-utc-date-time';

export const toTeamsMeetingOccurrence = (
  event: TeamsCalendarEvent,
): TeamsMeetingOccurrence | undefined => {
  const joinWebUrl = event.onlineMeeting?.joinUrl;
  const startDateTime = parseGraphUtcDateTime(event.start);
  const endDateTime = parseGraphUtcDateTime(event.end);

  if (
    !event.isOrganizer ||
    event.isCancelled ||
    event.onlineMeetingProvider !== 'teamsForBusiness' ||
    !isNonEmptyString(joinWebUrl) ||
    !isNonEmptyString(event.id) ||
    !isDefined(startDateTime) ||
    !isDefined(endDateTime)
  ) {
    return undefined;
  }

  const calendarReference = isNonEmptyString(event.seriesMasterId)
    ? { eventExternalId: event.seriesMasterId }
    : {
        eventExternalId: event.id,
        ...(isNonEmptyString(event.iCalUId) ? { iCalUId: event.iCalUId } : {}),
      };

  return { joinWebUrl, startDateTime, endDateTime, calendarReference };
};
