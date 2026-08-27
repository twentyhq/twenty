import { type Meeting } from 'fathom-typescript/sdk/models/shared';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type CalendarEventCandidate } from 'src/logic-functions/types/calendar-event-candidate.type';
import { listCalendarEventsInWindow } from 'src/logic-functions/utils/list-calendar-events-in-window.util';
import { normalizeMeetingUrl } from 'src/logic-functions/utils/normalize-meeting-url.util';

const MATCHING_WINDOW_MILLISECONDS = 5 * 60 * 1000;

const getConferenceUrl = (
  conferenceLink: CalendarEventCandidate['conferenceLink'],
): string | null | undefined =>
  typeof conferenceLink === 'string'
    ? conferenceLink
    : conferenceLink?.primaryLinkUrl;

export const findMatchingCalendarEvent = async ({
  coreApiClient,
  meeting,
}: {
  coreApiClient: Pick<CoreApiClient, 'query'>;
  meeting: Meeting;
}): Promise<string | undefined> => {
  const normalizedFathomMeetingUrl = normalizeMeetingUrl(meeting.meetingUrl);

  if (!normalizedFathomMeetingUrl) {
    return undefined;
  }

  const scheduledStartMilliseconds = meeting.scheduledStartTime.getTime();
  const calendarEvents = await listCalendarEventsInWindow({
    coreApiClient,
    earliestStart: new Date(
      scheduledStartMilliseconds - MATCHING_WINDOW_MILLISECONDS,
    ).toISOString(),
    latestStart: new Date(
      scheduledStartMilliseconds + MATCHING_WINDOW_MILLISECONDS,
    ).toISOString(),
  });

  if (calendarEvents === undefined) {
    return undefined;
  }

  const candidates = calendarEvents
    .filter(
      (candidate) =>
        normalizeMeetingUrl(getConferenceUrl(candidate.conferenceLink)) ===
        normalizedFathomMeetingUrl,
    )
    .map((candidate) => ({
      candidate,
      startDifference: Math.abs(
        new Date(candidate.startsAt).getTime() - scheduledStartMilliseconds,
      ),
    }))
    .sort(
      (firstCandidate, secondCandidate) =>
        firstCandidate.startDifference - secondCandidate.startDifference,
    );

  if (candidates.length === 0) {
    return undefined;
  }

  if (
    candidates.length > 1 &&
    candidates[0].startDifference === candidates[1].startDifference
  ) {
    return undefined;
  }

  return candidates[0].candidate.id;
};
