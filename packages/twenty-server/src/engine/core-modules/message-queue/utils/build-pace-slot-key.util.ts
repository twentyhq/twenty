import { isDefined } from 'twenty-shared/utils';

import {
  type QueueJobLimiter,
  type QueueJobScope,
} from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';

export const buildPaceSlotKey = ({
  scope,
  limiter,
}: {
  scope: Pick<QueueJobScope, 'workspaceId' | 'applicationUniversalIdentifier'>;
  limiter: Pick<QueueJobLimiter, 'key'>;
}): string | undefined =>
  isDefined(scope.workspaceId)
    ? `${scope.workspaceId}:${scope.applicationUniversalIdentifier ?? '-'}:${limiter.key}`
    : undefined;
