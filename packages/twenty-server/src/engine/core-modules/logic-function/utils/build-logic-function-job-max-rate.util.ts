import { isDefined } from 'twenty-shared/utils';

import { type QueueJobMaxRate } from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';
import { type MessageQueueMaxRate } from 'src/engine/core-modules/message-queue/types/message-queue-max-rate.type';

export const buildLogicFunctionJobMaxRate = ({
  logicFunctionId,
  maxRate,
}: {
  logicFunctionId: string;
  maxRate: MessageQueueMaxRate | null | undefined;
}): QueueJobMaxRate | undefined =>
  isDefined(maxRate)
    ? {
        key: `logicFunction:${logicFunctionId}`,
        max: maxRate.max,
        durationMs: maxRate.durationMs,
      }
    : undefined;
