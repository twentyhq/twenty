import { type Meeting } from 'fathom-typescript/sdk/models/shared';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'src/utils/is-defined';

import { type CalendarEventCandidate } from 'src/logic-functions/types/calendar-event-candidate.type';
import { listCalendarEventsInWindows } from 'src/logic-functions/utils/list-calendar-events-in-windows.util';
import { normalizeMeetingUrl } from 'src/logic-functions/utils/normalize-meeting-url.util';

const MATCHING_WINDOW_MILLISECONDS = 5 * 60 * 1000;

const selectMatchingCalendarEventId = ({
  calendarEvents,
  normalizedMeetingUrl,
  scheduledStartMilliseconds,
}: {
  calendarEvents: CalendarEventCandidate[];
  normalizedMeetingUrl: string;
  scheduledStartMilliseconds: number;
}): string | undefined => {
  const candidates = calendarEvents
    .map((candidate) => ({
      candidate,
      startDifference: Math.abs(
        new Date(candidate.startsAt).getTime() - scheduledStartMilliseconds,
      ),
    }))
    .filter(
      ({ candidate, startDifference }) =>
        startDifference <= MATCHING_WINDOW_MILLISECONDS &&
        normalizeMeetingUrl(candidate.conferenceLink?.primaryLinkUrl) ===
          normalizedMeetingUrl,
    )
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

export const findMatchingCalendarEvents = async ({
  coreApiClient,
  meetings,
}: {
  coreApiClient: Pick<CoreApiClient, 'query'>;
  meetings: Meeting[];
}): Promise<Map<number, string | undefined>> => {
  const matchingCalendarEventIds = new Map<number, string | undefined>();
  const matchableMeetings = meetings.flatMap((meeting) => {
    const normalizedMeetingUrl = normalizeMeetingUrl(meeting.meetingUrl);

    if (!isDefined(normalizedMeetingUrl)) {
      return [];
    }

    const scheduledStartMilliseconds = meeting.scheduledStartTime.getTime();

    return [
      {
        meeting,
        normalizedMeetingUrl,
        scheduledStartMilliseconds,
        window: {
          earliestStart: new Date(
            scheduledStartMilliseconds - MATCHING_WINDOW_MILLISECONDS,
          ).toISOString(),
          latestStart: new Date(
            scheduledStartMilliseconds + MATCHING_WINDOW_MILLISECONDS,
          ).toISOString(),
        },
      },
    ];
  });

  if (matchableMeetings.length === 0) {
    return matchingCalendarEventIds;
  }

  const sharedCalendarEvents = await listCalendarEventsInWindows({
    coreApiClient,
    windows: matchableMeetings.map(({ window }) => window),
  });

  for (const {
    meeting,
    normalizedMeetingUrl,
    scheduledStartMilliseconds,
    window,
  } of matchableMeetings) {
    const calendarEvents =
      isDefined(sharedCalendarEvents) || matchableMeetings.length === 1
        ? sharedCalendarEvents
        : await listCalendarEventsInWindows({
            coreApiClient,
            windows: [window],
          });

    matchingCalendarEventIds.set(
      meeting.recordingId,
      isDefined(calendarEvents)
        ? selectMatchingCalendarEventId({
            calendarEvents,
            normalizedMeetingUrl,
            scheduledStartMilliseconds,
          })
        : undefined,
    );
  }

  return matchingCalendarEventIds;
};
