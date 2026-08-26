import { type QueueJobBackoffOptions } from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';

export const LOGIC_FUNCTION_QUEUE_RETRY_BACKOFF = {
  strategy: 'exponential',
  initialDelayMilliseconds: 1_000,
  jitter: 0.5,
} as const satisfies QueueJobBackoffOptions;
