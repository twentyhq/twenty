import { type QueueJobOptions } from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';

// A role keeps access it lost until this runs, so it goes ahead of bulk
// workspace jobs and outlasts a database failover
export const AGENT_CHAT_CHANNEL_GRANTS_REWRITE_JOB_OPTIONS = {
  priority: 1,
  retryLimit: 8,
  backoff: { strategy: 'exponential', initialDelayMilliseconds: 5_000 },
} as const satisfies Pick<
  QueueJobOptions,
  'priority' | 'retryLimit' | 'backoff'
>;
