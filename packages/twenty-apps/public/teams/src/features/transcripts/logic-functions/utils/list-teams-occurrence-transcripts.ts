import { isDefined } from 'twenty-sdk/utils';

import { type GraphCallTranscript } from 'src/features/transcripts/logic-functions/types/graph-call-transcript.type';
import { type TeamsMeetingOccurrence } from 'src/features/transcripts/logic-functions/types/teams-meeting-occurrence.type';
import { type TeamsOccurrenceTranscript } from 'src/features/transcripts/logic-functions/types/teams-occurrence-transcript.type';
import { findTeamsTranscriptCalendarReference } from 'src/features/transcripts/logic-functions/utils/find-teams-transcript-calendar-reference';
import { getMeetingByJoinUrl } from 'src/features/transcripts/logic-functions/utils/get-meeting-by-join-url';
import { isTranscriptDuringOccurrence } from 'src/features/transcripts/logic-functions/utils/is-transcript-during-occurrence';
import { isUnavailableTeamsTranscriptError } from 'src/features/transcripts/logic-functions/utils/is-unavailable-teams-transcript-error';
import { listMeetingTranscripts } from 'src/features/transcripts/logic-functions/utils/list-meeting-transcripts';
import { toErrorMessage } from 'src/utils/to-error-message';

const listAvailableMeetingTranscriptsOrThrow = async ({
  accessToken,
  meetingId,
}: {
  accessToken: string;
  meetingId: string;
}): Promise<GraphCallTranscript[] | undefined> => {
  try {
    return await listMeetingTranscripts({ accessToken, meetingId });
  } catch (error) {
    if (!isUnavailableTeamsTranscriptError(error)) {
      throw error;
    }

    console.error(
      `[teams] skipped a meeting whose transcripts Microsoft Graph could not list: ${toErrorMessage(error)}`,
    );

    return undefined;
  }
};

const listMeetingOccurrenceTranscriptsOrThrow = async ({
  accessToken,
  joinWebUrl,
  occurrences,
}: {
  accessToken: string;
  joinWebUrl: string;
  occurrences: TeamsMeetingOccurrence[];
}): Promise<TeamsOccurrenceTranscript[] | undefined> => {
  const meeting = await getMeetingByJoinUrl({ accessToken, joinWebUrl });

  if (!isDefined(meeting)) {
    return [];
  }

  const meetingTranscripts = await listAvailableMeetingTranscriptsOrThrow({
    accessToken,
    meetingId: meeting.id,
  });

  return meetingTranscripts
    ?.filter((transcript) =>
      occurrences.some((occurrence) =>
        isTranscriptDuringOccurrence({ transcript, occurrence }),
      ),
    )
    .map((transcript) => ({
      meeting,
      transcript,
      calendarReference: findTeamsTranscriptCalendarReference({
        transcript,
        occurrences,
      }),
    }));
};

export const listTeamsOccurrenceTranscripts = async ({
  accessToken,
  occurrences,
}: {
  accessToken: string;
  occurrences: TeamsMeetingOccurrence[];
}): Promise<{
  transcripts: TeamsOccurrenceTranscript[];
  unavailableMeetingCount: number;
}> => {
  const joinWebUrls = [
    ...new Set(occurrences.map((occurrence) => occurrence.joinWebUrl)),
  ];
  const transcripts: TeamsOccurrenceTranscript[] = [];
  let unavailableMeetingCount = 0;

  for (const joinWebUrl of joinWebUrls) {
    const meetingTranscripts = await listMeetingOccurrenceTranscriptsOrThrow({
      accessToken,
      joinWebUrl,
      occurrences: occurrences.filter(
        (occurrence) => occurrence.joinWebUrl === joinWebUrl,
      ),
    });

    if (isDefined(meetingTranscripts)) {
      transcripts.push(...meetingTranscripts);
    } else {
      unavailableMeetingCount += 1;
    }
  }

  return { transcripts, unavailableMeetingCount };
};
