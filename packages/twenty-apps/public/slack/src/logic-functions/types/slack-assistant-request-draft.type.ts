export type SlackAssistantRequestDraft = {
  slackEventId: string;
  slackChannelId: string;
  slackChannelType: string;
  slackThreadTimestamp: string;
  slackMessageTimestamp: string;
  slackUserId: string;
  requestText: string;
};
