import { type SlackMessageBody } from 'src/logic-functions/types/slack-message-body.type';

export type SlackPostMessageInput = {
  slackChannelId: string;
  messageText: string;
  parentMessageTimestamp?: string;
} & SlackMessageBody;
