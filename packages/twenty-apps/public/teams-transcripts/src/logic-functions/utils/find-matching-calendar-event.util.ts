import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'src/utils/is-defined';

import { CALENDAR_EVENT_MATCHING_WINDOW_MILLISECONDS } from 'src/constants/teams.constant';
import { listCalendarEventsInWindow } from 'src/logic-functions/utils/list-calendar-events-in-window.util';
import { normalizeMeetingUrl } from 'src/logic-functions/utils/normalize-meeting-url.util';

// Twenty already syncs the organizer's Microsoft calendar, so the join URL
// stored on the calendar event is the link back to attendees and people.
export const findMatchingCalendarEvent = async ({
  coreApiClient,
  joinWebUrl,
  startDateTime,
}: {
  coreApiClient: Pick<CoreApiClient, 'query'>;
  joinWebUrl: string | null | undefined;
  startDateTime: string | null | undefined;
}): Promise<string | undefined> => {
  const normalizedJoinUrl = normalizeMeetingUrl(joinWebUrl);

  if (!isDefined(normalizedJoinUrl) || !isDefined(startDateTime)) {
    return undefined;
  }

  const startMilliseconds = new Date(startDateTime).getTime();

  if (!Number.isFinite(startMilliseconds)) {
    return undefined;
  }

  const calendarEvents = await listCalendarEventsInWindow({
    coreApiClient,
    earliestStart: new Date(
      startMilliseconds - CALENDAR_EVENT_MATCHING_WINDOW_MILLISECONDS,
    ).toISOString(),
    latestStart: new Date(
      startMilliseconds + CALENDAR_EVENT_MATCHING_WINDOW_MILLISECONDS,
    ).toISOString(),
  });

  if (!isDefined(calendarEvents)) {
    return undefined;
  }

  const candidates = calendarEvents
    .filter(
      (candidate) =>
        normalizeMeetingUrl(candidate.conferenceLink?.primaryLinkUrl) ===
        normalizedJoinUrl,
    )
    .map((candidate) => ({
      candidate,
      startDifference: Math.abs(
        new Date(candidate.startsAt).getTime() - startMilliseconds,
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
