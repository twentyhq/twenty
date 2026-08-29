export type SlackAssistantRequestRecord = {
  id: string;
  status?: string;
  slackChannelId?: string;
  slackChannelType?: string;
  slackThreadTimestamp?: string;
  slackMessageTimestamp?: string;
  slackUserId?: string;
  requestText?: string;
};
