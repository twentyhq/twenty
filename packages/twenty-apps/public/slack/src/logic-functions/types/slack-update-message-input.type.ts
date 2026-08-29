import { type SlackMessageBody } from 'src/logic-functions/types/slack-message-body.type';

export type SlackUpdateMessageInput = {
  slackChannelId: string;
  messageTimestamp: string;
  newMessageText: string;
} & SlackMessageBody;
