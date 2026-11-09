import { isDefined } from 'twenty-shared/utils';

import {
  type QueueJobMaxRate,
  type QueueJobScope,
} from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';

export const buildPaceSlotKey = ({
  scope,
  maxRate,
}: {
  scope: Pick<QueueJobScope, 'workspaceId' | 'applicationUniversalIdentifier'>;
  maxRate: Pick<QueueJobMaxRate, 'key'>;
}): string | undefined =>
  isDefined(scope.workspaceId)
    ? `${scope.workspaceId}:${scope.applicationUniversalIdentifier ?? '-'}:${maxRate.key}`
    : undefined;
