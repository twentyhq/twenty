import { isDefined } from 'twenty-shared/utils';

import {
  type QueueJobLimiter,
  type QueueJobScope,
} from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';

export const buildPaceSlotKey = ({
  scope,
  limiter,
}: {
  scope: Pick<QueueJobScope, 'workspaceId'>;
  limiter: Pick<QueueJobLimiter, 'key'>;
}): string | undefined =>
  isDefined(scope.workspaceId)
    ? `${scope.workspaceId}:${limiter.key}`
    : undefined;
