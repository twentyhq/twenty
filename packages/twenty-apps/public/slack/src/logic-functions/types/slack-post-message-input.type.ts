import { type SlackMessageBody } from 'src/logic-functions/types/slack-message-body.type';
import { type SlackUnfurlOptions } from 'src/logic-functions/types/slack-unfurl-options.type';

export type SlackPostMessageInput = {
  slackChannelId: string;
  messageText: string;
  parentMessageTimestamp?: string;
} & SlackMessageBody &
  SlackUnfurlOptions;
