import { type Meeting } from 'fathom-typescript/sdk/models/shared';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { normalizeMeetingUrl } from 'src/logic-functions/utils/normalize-meeting-url.util';

const MATCHING_WINDOW_MILLISECONDS = 5 * 60 * 1000;

type CalendarEventCandidate = {
  id: string;
  startsAt: string;
  conferenceLink: { primaryLinkUrl?: string | null } | string | null;
};

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
  coreApiClient: CoreApiClient;
  meeting: Meeting;
}): Promise<string | undefined> => {
  const normalizedFathomMeetingUrl = normalizeMeetingUrl(meeting.meetingUrl);

  if (!normalizedFathomMeetingUrl) {
    return undefined;
  }

  const scheduledStartMilliseconds = meeting.scheduledStartTime.getTime();
  const earliestStart = new Date(
    scheduledStartMilliseconds - MATCHING_WINDOW_MILLISECONDS,
  ).toISOString();
  const latestStart = new Date(
    scheduledStartMilliseconds + MATCHING_WINDOW_MILLISECONDS,
  ).toISOString();
  const queryResult = await coreApiClient.query({
    calendarEvents: {
      __args: {
        filter: {
          startsAt: { gte: earliestStart, lte: latestStart },
        },
        first: 20,
      },
      edges: {
        node: {
          id: true,
          startsAt: true,
          conferenceLink: {
            primaryLinkUrl: true,
          },
        },
      },
    },
  });
  const calendarEventEdges = (queryResult.calendarEvents?.edges ?? []) as Array<{
    node: CalendarEventCandidate;
  }>;
  const candidates = calendarEventEdges
    .map((edge) => edge.node)
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
    .sort((firstCandidate, secondCandidate) =>
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
