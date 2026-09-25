import { type TeamsMeetingWindow } from 'src/features/transcripts/logic-functions/types/teams-meeting-window.type';

export type TeamsMeetingOccurrence = TeamsMeetingWindow & {
  joinWebUrl: string;
};
