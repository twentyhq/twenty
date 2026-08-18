export type FakeSlackMessage = {
  channelId: string;
  timestamp: string;
  threadTimestamp?: string;
  userId?: string;
  botId?: string;
  text?: string;
  markdownText?: string;
  blocks?: unknown[];
};
