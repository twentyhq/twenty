import { type SlackMessageFile } from 'src/logic-functions/types/slack-message-file.type';

export type SlackMessageEventOptions = {
  channelId: string;
  text: string;
  userId?: string;
  messageTimestamp?: string;
  threadTimestamp?: string;
  channelType?: string;
  eventId?: string;
  teamId?: string;
  botUserId?: string;
  botId?: string;
  subtype?: string;
  files?: SlackMessageFile[];
};
