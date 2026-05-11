export type SlackUpdateMessageInput = {
  slackChannelId: string;
  messageTimestamp: string;
  newMessageText: string;
  useSlackMarkdown?: boolean;
};
