import { type QueueJobOptions } from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';

// Open apps only learn a snooze ended from this job, so a passing failure
// must not lose it
export const AGENT_CHAT_THREAD_SNOOZE_END_JOB_RETRY_OPTIONS = {
  retryLimit: 5,
  backoff: { strategy: 'exponential', initialDelayMilliseconds: 1_000 },
} as const satisfies Pick<QueueJobOptions, 'retryLimit' | 'backoff'>;
