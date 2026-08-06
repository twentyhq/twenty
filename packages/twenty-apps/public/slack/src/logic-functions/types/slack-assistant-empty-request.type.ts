export type SlackAssistantEmptyRequest = {
  slackChannelId: string;
  slackMessageTimestamp: string;
  parentMessageTimestamp: string | undefined;
  isInExistingThread: boolean;
};
