export type SendCampaignEmailBatchJobData = {
  workspaceId: string;
  campaignId: string;
  emailingDomainId: string;
  userWorkspaceId: string;
  recipients: { messageId: string; personId: string; email: string }[];
  rateLimitedAttemptCount?: number;
};
