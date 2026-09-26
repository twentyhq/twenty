import { isNonEmptyString } from '@sniptt/guards';

import { TEAMS_OCCURRENCE_MARGIN_MILLISECONDS } from 'src/features/transcripts/constants/teams.constant';
import { type GraphCallTranscript } from 'src/features/transcripts/logic-functions/types/graph-call-transcript.type';
import { type TeamsMeetingWindow } from 'src/features/transcripts/logic-functions/types/teams-meeting-window.type';

export const isTranscriptDuringOccurrence = ({
  transcript,
  occurrence,
}: {
  transcript: Pick<GraphCallTranscript, 'createdDateTime'>;
  occurrence: TeamsMeetingWindow;
}): boolean => {
  if (!isNonEmptyString(transcript.createdDateTime)) {
    return false;
  }

  const createdMilliseconds = Date.parse(transcript.createdDateTime);

  return (
    createdMilliseconds >=
      Date.parse(occurrence.startDateTime) -
        TEAMS_OCCURRENCE_MARGIN_MILLISECONDS &&
    createdMilliseconds <=
      Date.parse(occurrence.endDateTime) + TEAMS_OCCURRENCE_MARGIN_MILLISECONDS
  );
};
