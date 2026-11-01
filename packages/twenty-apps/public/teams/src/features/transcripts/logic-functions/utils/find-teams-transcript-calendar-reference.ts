import { type GraphCallTranscript } from 'src/features/transcripts/logic-functions/types/graph-call-transcript.type';
import { type TeamsCalendarReference } from 'src/features/transcripts/logic-functions/types/teams-calendar-reference.type';
import { type TeamsMeetingOccurrence } from 'src/features/transcripts/logic-functions/types/teams-meeting-occurrence.type';
import { isTranscriptDuringOccurrence } from 'src/features/transcripts/logic-functions/utils/is-transcript-during-occurrence';

export const findTeamsTranscriptCalendarReference = ({
  transcript,
  occurrences,
}: {
  transcript: Pick<GraphCallTranscript, 'createdDateTime'>;
  occurrences: TeamsMeetingOccurrence[];
}): TeamsCalendarReference | undefined => {
  const matchingOccurrences = occurrences.filter((occurrence) =>
    isTranscriptDuringOccurrence({ transcript, occurrence }),
  );

  return matchingOccurrences.length === 1
    ? matchingOccurrences[0].calendarReference
    : undefined;
};
