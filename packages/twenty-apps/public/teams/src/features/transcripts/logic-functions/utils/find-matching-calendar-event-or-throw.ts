import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { TEAMS_OCCURRENCE_MARGIN_MILLISECONDS } from 'src/features/transcripts/logic-functions/constants/teams-occurrence-margin-milliseconds';
import { type GraphCallTranscript } from 'src/features/transcripts/logic-functions/types/graph-call-transcript.type';
import { type GraphOnlineMeeting } from 'src/features/transcripts/logic-functions/types/graph-online-meeting.type';

type CalendarEventMatches = {
  edges: { node: { id: string } }[];
};

export const findMatchingCalendarEventOrThrow = async ({
  coreApiClient,
  meeting,
  transcript,
}: {
  coreApiClient: Pick<CoreApiClient, 'query'>;
  meeting: Pick<GraphOnlineMeeting, 'joinWebUrl'>;
  transcript: Pick<GraphCallTranscript, 'createdDateTime'>;
}): Promise<string | undefined> => {
  if (
    !isNonEmptyString(meeting.joinWebUrl) ||
    !isNonEmptyString(transcript.createdDateTime)
  ) {
    return undefined;
  }

  const transcriptStartMilliseconds = Date.parse(transcript.createdDateTime);

  if (!Number.isFinite(transcriptStartMilliseconds)) {
    return undefined;
  }

  // Every occurrence of a recurring meeting shares one join URL, so the
  // transcript start picks the occurrence, with the same margin as listing.
  const result = await coreApiClient.query({
    calendarEvents: {
      __args: {
        filter: {
          and: [
            { conferenceLink: { primaryLinkUrl: { eq: meeting.joinWebUrl } } },
            {
              startsAt: {
                lte: new Date(
                  transcriptStartMilliseconds +
                    TEAMS_OCCURRENCE_MARGIN_MILLISECONDS,
                ).toISOString(),
              },
            },
            {
              endsAt: {
                gte: new Date(
                  transcriptStartMilliseconds -
                    TEAMS_OCCURRENCE_MARGIN_MILLISECONDS,
                ).toISOString(),
              },
            },
            { isCanceled: { eq: false } },
          ],
        },
        first: 2,
      },
      edges: { node: { id: true } },
    },
  });
  const calendarEvents: CalendarEventMatches | undefined =
    result.calendarEvents;

  return calendarEvents?.edges.length === 1
    ? calendarEvents.edges[0].node.id
    : undefined;
};
