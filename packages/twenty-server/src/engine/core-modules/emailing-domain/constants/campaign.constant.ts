import { type QueueJobBackoffOptions } from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';

export const CAMPAIGN_MESSAGE_DELIVERY_STATUS = {
  QUEUED: 'QUEUED',
  SENDING: 'SENDING',
  SENT: 'SENT',
  DELIVERED: 'DELIVERED',
  FAILED: 'FAILED',
  REJECTED: 'REJECTED',
  RENDERING_FAILED: 'RENDERING_FAILED',
  SOFT_BOUNCED: 'SOFT_BOUNCED',
  BOUNCED: 'BOUNCED',
  COMPLAINED: 'COMPLAINED',
  SKIPPED: 'SKIPPED',
} as const;

export const MATERIALIZE_CAMPAIGN_JOB = 'MaterializeCampaignJob';
export const SEND_CAMPAIGN_EMAIL_JOB = 'SendCampaignEmailJob';
export const REFRESH_CAMPAIGN_STATS_JOB = 'RefreshCampaignStatsJob';

export const CAMPAIGN_STATS_REFRESH_DEBOUNCE_MS = 10_000;
export const CAMPAIGN_STATS_REFRESH_DELAY_MS =
  CAMPAIGN_STATS_REFRESH_DEBOUNCE_MS + 2_000;

export const MAX_CAMPAIGN_RECIPIENTS = 10000;

export const CAMPAIGN_SENDING_STALE_THRESHOLD_MS = 60 * 60 * 1000;
export const CAMPAIGN_MATERIALIZATION_CHUNK_SIZE = 500;

export const CAMPAIGN_MESSAGE_CLAIM_STALE_THRESHOLD_MS = 15 * 60 * 1000;

export const CAMPAIGN_MESSAGE_ID_NAMESPACE =
  '0c4b9e7a-3f2d-4b6c-9e1a-7d8f5a2c3b4e';

export const CAMPAIGN_SEND_RETRY_LIMIT = 3;

export const CAMPAIGN_SEND_RETRY_BACKOFF: QueueJobBackoffOptions = {
  strategy: 'exponential',
  initialDelayMilliseconds: 5_000,
  jitter: 0.5,
};
