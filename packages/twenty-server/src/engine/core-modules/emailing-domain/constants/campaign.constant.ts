// Per-recipient delivery status stored on `message.deliveryStatus` for campaign
// sends (matches the SELECT options in the message field metadata).
export const CAMPAIGN_MESSAGE_DELIVERY_STATUS = {
  QUEUED: 'QUEUED',
  SENT: 'SENT',
  FAILED: 'FAILED',
  BOUNCED: 'BOUNCED',
  COMPLAINED: 'COMPLAINED',
  // Recipient was suppressed (bounced/complained/unsubscribed) at send time —
  // intentionally not delivered, distinct from a delivery FAILED.
  SKIPPED: 'SKIPPED',
} as const;

// Campaign-level lifecycle status stored on `messageCampaign.status`. A send
// always finishes as SENT, or SENT_WITH_ERRORS when at least one recipient
// terminally FAILED — there is no campaign-level FAILED outcome.
export const CAMPAIGN_STATUS = {
  DRAFT: 'DRAFT',
  SCHEDULED: 'SCHEDULED',
  SENDING: 'SENDING',
  SENT: 'SENT',
  SENT_WITH_ERRORS: 'SENT_WITH_ERRORS',
} as const;

// Job names on the email queue. String constants (not the job classes) so the
// enqueuing service and the processors don't import each other.
//
// The resolver enqueues one MATERIALIZE_CAMPAIGN_JOB carrying only recipient
// refs; that job creates the per-recipient messages and fans out one
// SEND_CAMPAIGN_EMAIL_JOB each (carrying ids only, never the body).
export const MATERIALIZE_CAMPAIGN_JOB = 'MaterializeCampaignJob';
export const SEND_CAMPAIGN_EMAIL_JOB = 'SendCampaignEmailJob';

// Hard cap on recipients materialized + sent per campaign.
export const MAX_CAMPAIGN_RECIPIENTS = 10000;

// Namespace for deriving each recipient's message id deterministically from
// (campaignId, personId) via uuid v5. Lets the fan-out job re-run idempotently:
// a message that already exists is skipped instead of duplicated.
export const CAMPAIGN_MESSAGE_ID_NAMESPACE =
  '0c4b9e7a-3f2d-4b6c-9e1a-7d8f5a2c3b4e';
