import { type TeamsActivityAttachment } from 'src/features/chat/logic-functions/types/teams-activity-attachment.type';
import { type TeamsActivityEntity } from 'src/features/chat/logic-functions/types/teams-activity-entity.type';
import { type TeamsSuggestedActions } from 'src/features/chat/logic-functions/types/teams-suggested-actions.type';

export type TeamsActivity = {
  type: 'message' | 'typing';
  text?: string;
  textFormat?: 'extendedmarkdown';
  attachments?: TeamsActivityAttachment[];
  entities?: TeamsActivityEntity[];
  suggestedActions?: TeamsSuggestedActions;
};
