import { isDefined } from 'twenty-shared/utils';

import { type QueueJobScope } from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';

export const buildPaceSlotKey = ({
  scope,
  groupKey,
}: {
  scope: Pick<QueueJobScope, 'workspaceId'>;
  groupKey: string | undefined;
}): string | undefined =>
  isDefined(scope.workspaceId) && isDefined(groupKey)
    ? // From 2.60 on, reserved slots live under this prefix, so it must not change.
      `${scope.workspaceId}:jobGroup:${groupKey}`
    : undefined;
