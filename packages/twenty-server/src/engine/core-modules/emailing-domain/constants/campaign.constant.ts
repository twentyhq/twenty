export const CAMPAIGN_MESSAGE_DELIVERY_STATUS = {
  QUEUED: 'QUEUED',
  SENT: 'SENT',
  FAILED: 'FAILED',
  BOUNCED: 'BOUNCED',
  COMPLAINED: 'COMPLAINED',
  SKIPPED: 'SKIPPED',
} as const;

export const MATERIALIZE_CAMPAIGN_JOB = 'MaterializeCampaignJob';
export const SEND_CAMPAIGN_EMAIL_BATCH_JOB = 'SendCampaignEmailBatchJob';
export const REFRESH_CAMPAIGN_STATS_JOB = 'RefreshCampaignStatsJob';

export const CAMPAIGN_STATS_REFRESH_DEBOUNCE_MS = 10_000;
export const CAMPAIGN_STATS_REFRESH_DELAY_MS =
  CAMPAIGN_STATS_REFRESH_DEBOUNCE_MS + 2_000;

export const MAX_CAMPAIGN_RECIPIENTS = 10000;

// The provider bills every destination in a bulk call against its per-second
// send rate, so one batch per interval has to stay under that rate rather than
// under the 50-destination call ceiling.
export const CAMPAIGN_SEND_BATCH_SIZE = 12;
export const CAMPAIGN_SEND_BATCH_INTERVAL_MS = 1000;

export const MAX_CAMPAIGN_EMAILS_SENDABLE = 2000;
export const MAX_CAMPAIGN_EMAILS_SENDABLE_UNVERIFIED = 500;
export const CAMPAIGN_QUOTA_WINDOW_MS = 24 * 60 * 60 * 1000;

export const CAMPAIGN_TEST_SEND_THROTTLE_LIMIT = 5;
export const CAMPAIGN_TEST_SEND_THROTTLE_WINDOW_MS = 10 * 60 * 1000;

export const CAMPAIGN_MESSAGE_ID_NAMESPACE =
  '0c4b9e7a-3f2d-4b6c-9e1a-7d8f5a2c3b4e';
