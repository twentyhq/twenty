import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { CALENDAR_EVENT_MATCHING_WINDOW_MILLISECONDS } from 'src/logic-functions/constants/calendar-event-matching.constant';
import { type CalendarEventCandidate } from 'src/logic-functions/types/calendar-event-candidate.type';
import { type GoogleMeetConferenceRecord } from 'src/logic-functions/types/google-meet-conference-record.type';
import { type GoogleMeetSpace } from 'src/logic-functions/types/google-meet-space.type';
import { listCalendarEventsInWindow } from 'src/logic-functions/utils/list-calendar-events-in-window.util';
import { normalizeMeetingUrl } from 'src/logic-functions/utils/normalize-meeting-url.util';

export const findGoogleMeetCalendarEvent = async ({
  coreApiClient,
  conferenceRecord,
  space,
}: {
  coreApiClient: Pick<CoreApiClient, 'query'>;
  conferenceRecord: Pick<GoogleMeetConferenceRecord, 'startTime'>;
  space: Pick<GoogleMeetSpace, 'meetingUri'>;
}): Promise<Pick<CalendarEventCandidate, 'id' | 'title'> | undefined> => {
  const meetingUrl = normalizeMeetingUrl(space.meetingUri);

  if (!isDefined(meetingUrl)) {
    return undefined;
  }

  const meetingCode = meetingUrl.slice(meetingUrl.lastIndexOf('/') + 1);

  if (!isNonEmptyString(meetingCode)) {
    return undefined;
  }

  const conferenceStartMilliseconds = Date.parse(conferenceRecord.startTime);
  const calendarEvents = await listCalendarEventsInWindow({
    coreApiClient,
    earliestStart: new Date(
      conferenceStartMilliseconds - CALENDAR_EVENT_MATCHING_WINDOW_MILLISECONDS,
    ).toISOString(),
    latestStart: new Date(
      conferenceStartMilliseconds + CALENDAR_EVENT_MATCHING_WINDOW_MILLISECONDS,
    ).toISOString(),
    conferenceLinkFragment: meetingCode,
  });

  if (!isDefined(calendarEvents)) {
    return undefined;
  }

  const [closestCandidate, nextCandidate] = calendarEvents
    .filter(
      ({ conferenceLink }) =>
        normalizeMeetingUrl(conferenceLink?.primaryLinkUrl) === meetingUrl,
    )
    .map(({ id, title, startsAt }) => ({
      id,
      title,
      startDifference: Math.abs(
        Date.parse(startsAt) - conferenceStartMilliseconds,
      ),
    }))
    .sort(
      (firstCandidate, secondCandidate) =>
        firstCandidate.startDifference - secondCandidate.startDifference,
    );

  if (
    !isDefined(closestCandidate) ||
    closestCandidate.startDifference === nextCandidate?.startDifference
  ) {
    return undefined;
  }

  return { id: closestCandidate.id, title: closestCandidate.title };
};
