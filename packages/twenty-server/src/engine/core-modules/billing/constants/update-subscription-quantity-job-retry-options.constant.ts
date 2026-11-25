import { type QueueJobSettings } from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';

export const UPDATE_SUBSCRIPTION_QUANTITY_JOB_RETRY_OPTIONS: Pick<
  QueueJobSettings,
  'retryLimit' | 'backoff'
> = {
  retryLimit: 5,
  backoff: {
    strategy: 'exponential',
    initialDelayMilliseconds: 60_000,
    jitter: 0.5,
  },
};
