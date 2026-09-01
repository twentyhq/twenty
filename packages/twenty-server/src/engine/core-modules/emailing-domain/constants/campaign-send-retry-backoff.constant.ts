import { type QueueJobBackoffOptions } from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';

export const CAMPAIGN_SEND_RETRY_BACKOFF = {
  strategy: 'exponential',
  initialDelayMilliseconds: 30_000,
  jitter: 0.5,
} as const satisfies QueueJobBackoffOptions;
