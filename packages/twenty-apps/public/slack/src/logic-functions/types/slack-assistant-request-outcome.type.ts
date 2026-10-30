import { type SlackAssistantRequestStatus } from 'src/logic-functions/types/slack-assistant-request-status.type';

export type SlackAssistantRequestOutcome = {
  status: SlackAssistantRequestStatus;
  responseText: string | null;
};
