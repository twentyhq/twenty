import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { TEAMS_OCCURRENCE_MARGIN_MILLISECONDS } from 'src/features/transcripts/logic-functions/constants/teams-occurrence-margin-milliseconds';
import { type GraphCallTranscript } from 'src/features/transcripts/logic-functions/types/graph-call-transcript.type';
import { type GraphOnlineMeeting } from 'src/features/transcripts/logic-functions/types/graph-online-meeting.type';
import { GraphRequestError } from 'src/features/transcripts/logic-functions/types/graph-request-error';
import { type TeamsMeetingOccurrence } from 'src/features/transcripts/logic-functions/types/teams-meeting-occurrence.type';
import { buildTeamsCalendarViewUrl } from 'src/features/transcripts/logic-functions/utils/build-teams-calendar-view-url';
import { findTeamsCalendarEventIdsOrThrow } from 'src/features/transcripts/logic-functions/utils/find-teams-calendar-event-ids-or-throw';
import { findTeamsTranscriptCalendarReference } from 'src/features/transcripts/logic-functions/utils/find-teams-transcript-calendar-reference';
import { listTeamsCalendarPage } from 'src/features/transcripts/logic-functions/utils/list-teams-calendar-page';

const listOccurrencesAroundTranscriptStartOrThrow = async ({
  accessToken,
  transcriptStartMilliseconds,
}: {
  accessToken: string;
  transcriptStartMilliseconds: number;
}): Promise<TeamsMeetingOccurrence[]> => {
  try {
    const { occurrences } = await listTeamsCalendarPage({
      accessToken,
      url: buildTeamsCalendarViewUrl({
        startDateTime: new Date(
          transcriptStartMilliseconds - TEAMS_OCCURRENCE_MARGIN_MILLISECONDS,
        ).toISOString(),
        endDateTime: new Date(
          transcriptStartMilliseconds + TEAMS_OCCURRENCE_MARGIN_MILLISECONDS,
        ).toISOString(),
      }),
    });

    return occurrences;
  } catch (error) {
    if (
      error instanceof GraphRequestError &&
      (error.status === 403 || error.status === 404)
    ) {
      return [];
    }

    throw error;
  }
};

export const findTeamsTranscriptCalendarEventIdOrThrow = async ({
  accessToken,
  coreApiClient,
  meeting,
  transcript,
}: {
  accessToken: string;
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

  const occurrences = await listOccurrencesAroundTranscriptStartOrThrow({
    accessToken,
    transcriptStartMilliseconds,
  });
  const calendarReference = findTeamsTranscriptCalendarReference({
    transcript,
    occurrences: occurrences.filter(
      (occurrence) => occurrence.joinWebUrl === meeting.joinWebUrl,
    ),
  });

  if (!isDefined(calendarReference)) {
    return undefined;
  }

  const calendarEventIds = await findTeamsCalendarEventIdsOrThrow({
    accessToken,
    coreApiClient,
    references: [calendarReference],
  });

  return calendarEventIds.get(calendarReference.eventExternalId);
};
