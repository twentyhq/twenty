import { isDefined } from 'twenty-shared/utils';

import { type QueueJobLimiter } from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';
import { type MessageQueueLimiter } from 'src/engine/core-modules/message-queue/types/message-queue-limiter.type';

export const buildQueueJobLimiter = ({
  key,
  limiter,
}: {
  key: string;
  limiter: MessageQueueLimiter | null | undefined;
}): QueueJobLimiter | undefined =>
  isDefined(limiter)
    ? { key, max: limiter.max, durationMs: limiter.durationMs }
    : undefined;
