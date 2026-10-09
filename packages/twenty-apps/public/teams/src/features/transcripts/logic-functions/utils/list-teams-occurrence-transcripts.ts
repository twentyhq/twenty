import { isDefined } from 'twenty-sdk/utils';

import { type TeamsMeetingOccurrence } from 'src/features/transcripts/logic-functions/types/teams-meeting-occurrence.type';
import { type TeamsOccurrenceTranscript } from 'src/features/transcripts/logic-functions/types/teams-occurrence-transcript.type';
import { findTeamsTranscriptCalendarReference } from 'src/features/transcripts/logic-functions/utils/find-teams-transcript-calendar-reference';
import { getMeetingByJoinUrl } from 'src/features/transcripts/logic-functions/utils/get-meeting-by-join-url';
import { isTranscriptDuringOccurrence } from 'src/features/transcripts/logic-functions/utils/is-transcript-during-occurrence';
import { isUnavailableTeamsTranscriptError } from 'src/features/transcripts/logic-functions/utils/is-unavailable-teams-transcript-error';
import { listMeetingTranscripts } from 'src/features/transcripts/logic-functions/utils/list-meeting-transcripts';
import { toErrorMessage } from 'src/features/transcripts/logic-functions/utils/to-error-message';

const listMeetingOccurrenceTranscriptsOrThrow = async ({
  accessToken,
  joinWebUrl,
  occurrences,
}: {
  accessToken: string;
  joinWebUrl: string;
  occurrences: TeamsMeetingOccurrence[];
}): Promise<TeamsOccurrenceTranscript[]> => {
  try {
    const meeting = await getMeetingByJoinUrl({ accessToken, joinWebUrl });

    if (!isDefined(meeting)) {
      return [];
    }

    const meetingTranscripts = await listMeetingTranscripts({
      accessToken,
      meetingId: meeting.id,
    });

    return meetingTranscripts
      .filter((transcript) =>
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
  } catch (error) {
    if (!isUnavailableTeamsTranscriptError(error)) {
      throw error;
    }

    console.error(
      `[teams] skipped a meeting whose transcripts Microsoft Graph could not list: ${toErrorMessage(error)}`,
    );

    return [];
  }
};

export const listTeamsOccurrenceTranscripts = async ({
  accessToken,
  occurrences,
}: {
  accessToken: string;
  occurrences: TeamsMeetingOccurrence[];
}): Promise<TeamsOccurrenceTranscript[]> => {
  const joinWebUrls = [
    ...new Set(occurrences.map((occurrence) => occurrence.joinWebUrl)),
  ];
  const transcripts: TeamsOccurrenceTranscript[] = [];

  for (const joinWebUrl of joinWebUrls) {
    transcripts.push(
      ...(await listMeetingOccurrenceTranscriptsOrThrow({
        accessToken,
        joinWebUrl,
        occurrences: occurrences.filter(
          (occurrence) => occurrence.joinWebUrl === joinWebUrl,
        ),
      })),
    );
  }

  return transcripts;
};
