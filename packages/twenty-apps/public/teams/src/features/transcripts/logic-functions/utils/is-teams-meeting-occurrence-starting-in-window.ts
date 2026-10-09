import { type TeamsMeetingOccurrence } from 'src/features/transcripts/logic-functions/types/teams-meeting-occurrence.type';
import { type TeamsMeetingWindow } from 'src/features/transcripts/logic-functions/types/teams-meeting-window.type';

export const isTeamsMeetingOccurrenceStartingInWindow = ({
  occurrence,
  window,
}: {
  occurrence: Pick<TeamsMeetingOccurrence, 'startDateTime'>;
  window: TeamsMeetingWindow;
}): boolean => {
  const startMilliseconds = Date.parse(occurrence.startDateTime);

  return (
    startMilliseconds >= Date.parse(window.startDateTime) &&
    startMilliseconds < Date.parse(window.endDateTime)
  );
};
