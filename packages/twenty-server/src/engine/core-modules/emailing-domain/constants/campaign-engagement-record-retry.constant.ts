import { type QueueJobBackoffOptions } from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';

// Exponential from 5 s over 14 attempts spans roughly 22 hours, long enough
// to ride out a ClickHouse outage without a custom capped-backoff strategy.
export const CAMPAIGN_ENGAGEMENT_RECORD_RETRY_LIMIT = 14;

export const CAMPAIGN_ENGAGEMENT_RECORD_RETRY_BACKOFF = {
  strategy: 'exponential',
  initialDelayMilliseconds: 5_000,
  jitter: 0.5,
} as const satisfies QueueJobBackoffOptions;
