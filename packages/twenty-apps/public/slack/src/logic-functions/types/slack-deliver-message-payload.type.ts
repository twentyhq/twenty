import { type SlackPostMessageInput } from 'src/logic-functions/types/slack-post-message-input.type';

export type SlackDeliverMessagePayload = SlackPostMessageInput & {
  attempt?: number;
  slackAssistantRequestId?: string;
};
