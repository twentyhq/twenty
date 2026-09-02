import { type Meeting } from 'fathom-typescript/sdk/models/shared';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'src/utils/is-defined';

import { listCalendarEventsInWindow } from 'src/logic-functions/utils/list-calendar-events-in-window.util';
import { normalizeMeetingUrl } from 'src/logic-functions/utils/normalize-meeting-url.util';

const MATCHING_WINDOW_MILLISECONDS = 5 * 60 * 1000;

export const findMatchingCalendarEvent = async ({
  coreApiClient,
  meeting,
}: {
  coreApiClient: Pick<CoreApiClient, 'query'>;
  meeting: Meeting;
}): Promise<string | undefined> => {
  const normalizedFathomMeetingUrl = normalizeMeetingUrl(meeting.meetingUrl);

  if (!isDefined(normalizedFathomMeetingUrl)) {
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

  if (!isDefined(calendarEvents)) {
    return undefined;
  }

  const candidates = calendarEvents
    .filter(
      (candidate) =>
        normalizeMeetingUrl(candidate.conferenceLink?.primaryLinkUrl) ===
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
