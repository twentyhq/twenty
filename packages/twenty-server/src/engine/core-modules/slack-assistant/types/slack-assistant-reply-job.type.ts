export type SlackAssistantReplyJobData = {
  teamId: string;
  enterpriseId?: string;
  channelId: string;
  threadTs: string;
  text: string;
  slackUserId?: string;
  eventId?: string;
};
