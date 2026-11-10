import { type QueueJobLimiter } from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';
import { type MessageQueueLimiter } from 'src/engine/core-modules/message-queue/types/message-queue-limiter.type';
import { buildQueueJobLimiter } from 'src/engine/core-modules/message-queue/utils/build-queue-job-limiter.util';

export const buildLogicFunctionJobLimiter = ({
  logicFunctionId,
  limiter,
}: {
  logicFunctionId: string;
  limiter: MessageQueueLimiter | null | undefined;
}): QueueJobLimiter | undefined =>
  buildQueueJobLimiter({ key: `logicFunction:${logicFunctionId}`, limiter });
