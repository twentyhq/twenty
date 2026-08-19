export type FakeSlackEphemeralMessage = {
  channelId: string;
  recipientUserId: string;
  threadTimestamp?: string;
  text?: string;
  markdownText?: string;
};
