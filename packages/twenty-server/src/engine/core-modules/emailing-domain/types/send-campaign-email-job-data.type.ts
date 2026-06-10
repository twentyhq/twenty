export type SendCampaignEmailJobData = {
  workspaceId: string;
  campaignId: string;
  // The already-materialized (QUEUED) message for this recipient.
  messageId: string;
  recipientEmail: string;
  emailingDomainId: string;
  messageTopicId: string;
  fromAddress: string;
  subject: string;
  html: string;
};
