import { type TeamsAssistantStatusMessage } from 'src/features/chat/logic-functions/types/teams-assistant-status-message.type';

export type TeamsAssistantStatusWriter = {
  update: (text: string) => Promise<void>;
  finish: (message: TeamsAssistantStatusMessage) => Promise<string>;
};
