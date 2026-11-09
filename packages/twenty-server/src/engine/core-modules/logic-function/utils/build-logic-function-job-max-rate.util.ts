import { type QueueJobMaxRate } from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';
import { type MessageQueueMaxRate } from 'src/engine/core-modules/message-queue/types/message-queue-max-rate.type';
import { buildQueueJobMaxRate } from 'src/engine/core-modules/message-queue/utils/build-queue-job-max-rate.util';

export const buildLogicFunctionJobMaxRate = ({
  logicFunctionId,
  maxRate,
}: {
  logicFunctionId: string;
  maxRate: MessageQueueMaxRate | null | undefined;
}): QueueJobMaxRate | undefined =>
  buildQueueJobMaxRate({ key: `logicFunction:${logicFunctionId}`, maxRate });
