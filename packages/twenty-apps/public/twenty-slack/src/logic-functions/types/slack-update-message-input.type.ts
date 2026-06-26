import { type SlackMessageBodyFormat } from 'src/logic-functions/types/slack-message-body-format.type';

export type SlackUpdateMessageInput = {
  slackChannelId: string;
  messageTimestamp: string;
  newMessageText: string;
  messageFormat?: SlackMessageBodyFormat;
};
