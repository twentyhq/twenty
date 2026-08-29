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
};
