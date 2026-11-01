import { type TeamsCalendarReference } from 'src/features/transcripts/logic-functions/types/teams-calendar-reference.type';
import { type TeamsMeetingWindow } from 'src/features/transcripts/logic-functions/types/teams-meeting-window.type';

export type TeamsMeetingOccurrence = TeamsMeetingWindow & {
  joinWebUrl: string;
  calendarReference: TeamsCalendarReference;
};
