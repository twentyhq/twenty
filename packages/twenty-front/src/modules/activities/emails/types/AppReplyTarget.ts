// Set when the reply account is an app connection: the reply goes through the app's messaging provider
export type AppReplyTarget = {
  messageChannelId: string;
  messageThreadId: string;
};
