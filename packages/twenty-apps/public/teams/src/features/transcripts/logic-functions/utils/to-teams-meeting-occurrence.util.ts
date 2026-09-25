import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { type TeamsCalendarEvent } from 'src/features/transcripts/logic-functions/types/teams-calendar-event.type';
import { type TeamsMeetingOccurrence } from 'src/features/transcripts/logic-functions/types/teams-meeting-occurrence.type';
import { parseGraphUtcDateTime } from 'src/features/transcripts/logic-functions/utils/parse-graph-utc-date-time.util';

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
    !isDefined(startDateTime) ||
    !isDefined(endDateTime)
  ) {
    return undefined;
  }

  return { joinWebUrl, startDateTime, endDateTime };
};
