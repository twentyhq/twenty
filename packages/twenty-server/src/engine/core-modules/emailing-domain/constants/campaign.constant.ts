// Per-recipient delivery status stored on `message.deliveryStatus` for campaign
// sends (matches the SELECT options in the message field metadata).
export const CAMPAIGN_MESSAGE_DELIVERY_STATUS = {
  QUEUED: 'QUEUED',
  SENT: 'SENT',
  FAILED: 'FAILED',
  BOUNCED: 'BOUNCED',
  COMPLAINED: 'COMPLAINED',
} as const;

// Campaign-level lifecycle status stored on `messageCampaign.status`.
export const CAMPAIGN_STATUS = {
  DRAFT: 'DRAFT',
  SCHEDULED: 'SCHEDULED',
  SENDING: 'SENDING',
  SENT: 'SENT',
  FAILED: 'FAILED',
} as const;

// Job name for the per-recipient send job on the email queue. A string constant
// (not the job class) so the enqueuing service and the processor don't import
// each other.
export const SEND_CAMPAIGN_EMAIL_JOB = 'SendCampaignEmailJob';

// Hard cap on recipients materialized + sent per campaign.
export const MAX_CAMPAIGN_RECIPIENTS = 10000;
