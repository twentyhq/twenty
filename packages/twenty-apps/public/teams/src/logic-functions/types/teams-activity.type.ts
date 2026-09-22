import { type TeamsActivityAttachment } from 'src/logic-functions/types/teams-activity-attachment.type';

export type TeamsActivity = {
  type: 'message' | 'typing';
  text?: string;
  attachments?: TeamsActivityAttachment[];
};
