export type SlackPostMessageInput = {
  slackChannelId: string;
  messageText: string;
  parentMessageTimestamp?: string;
  useSlackMarkdown?: boolean;
};
