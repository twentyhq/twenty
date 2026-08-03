import { type SlackMessageBodyFormat } from 'src/logic-functions/types/slack-message-body-format.type';

export type SlackPostEphemeralMessageInput = {
  slackChannelId: string;
  recipientSlackUserId: string;
  messageText: string;
  messageFormat?: SlackMessageBodyFormat;
};
