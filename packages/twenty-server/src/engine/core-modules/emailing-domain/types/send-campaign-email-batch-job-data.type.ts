export type SendCampaignEmailBatchRecipient = {
  messageId: string;
  personId: string;
  recipientEmail: string;
};

export type SendCampaignEmailBatchJobData = {
  workspaceId: string;
  campaignId: string;
  emailingDomainId: string;
  recipients: SendCampaignEmailBatchRecipient[];
};
