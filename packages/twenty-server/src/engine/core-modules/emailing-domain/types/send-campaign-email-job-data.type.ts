export type SendCampaignEmailJobData = {
  workspaceId: string;
  campaignId: string;
  messageId: string;
  personId: string;
  recipientEmail: string;
  emailingDomainId: string;
};
