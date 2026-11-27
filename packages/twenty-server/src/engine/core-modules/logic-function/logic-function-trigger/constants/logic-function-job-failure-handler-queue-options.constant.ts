import { LOGIC_FUNCTION_QUEUE_RETRY_BACKOFF } from 'src/engine/core-modules/logic-function/logic-function-trigger/constants/logic-function-queue-retry-backoff.constant';
import { type QueueJobSettings } from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';

// The handler job id is derived from the failed job id, so the queue drops a second enqueue for the same failure.
export const LOGIC_FUNCTION_JOB_FAILURE_HANDLER_QUEUE_OPTIONS = {
  retryLimit: 3,
  backoff: LOGIC_FUNCTION_QUEUE_RETRY_BACKOFF,
  doNotCheckDuplicatesBasedOnPrefix: true,
} as const satisfies QueueJobSettings;
