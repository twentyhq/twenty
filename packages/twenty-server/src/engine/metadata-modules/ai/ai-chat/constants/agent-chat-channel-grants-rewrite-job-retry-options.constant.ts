import { type QueueJobOptions } from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';

export const AGENT_CHAT_CHANNEL_GRANTS_REWRITE_JOB_RETRY_OPTIONS = {
  retryLimit: 5,
  backoff: { strategy: 'exponential', initialDelayMilliseconds: 1_000 },
} as const satisfies Pick<QueueJobOptions, 'retryLimit' | 'backoff'>;
