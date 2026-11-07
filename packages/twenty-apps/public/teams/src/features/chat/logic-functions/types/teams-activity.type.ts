import { type TeamsActivityAttachment } from 'src/features/chat/logic-functions/types/teams-activity-attachment.type';
import { type TeamsActivityEntity } from 'src/features/chat/logic-functions/types/teams-activity-entity.type';

export type TeamsActivity = {
  type: 'message' | 'typing';
  text?: string;
  attachments?: TeamsActivityAttachment[];
  entities?: TeamsActivityEntity[];
};
