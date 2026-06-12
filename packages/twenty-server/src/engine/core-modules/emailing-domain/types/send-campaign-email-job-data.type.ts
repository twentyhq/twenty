// Per-recipient send job payload: ids only. The subject/body template is loaded
// from the campaign row and rendered against the recipient (personId) at send
// time, so the body is never duplicated across the queue.
export type SendCampaignEmailJobData = {
  workspaceId: string;
  campaignId: string;
  // The already-materialized (QUEUED) message for this recipient.
  messageId: string;
  personId: string;
  recipientEmail: string;
  emailingDomainId: string;
};
