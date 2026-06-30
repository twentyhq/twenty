import { type SlackMessageBodyFormat } from 'src/logic-functions/types/slack-message-body-format.type';

export type SlackPostMessageInput = {
  slackChannelId: string;
  messageText: string;
  parentMessageTimestamp?: string;
  messageFormat?: SlackMessageBodyFormat;
};
