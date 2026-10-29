import { type QueueJobScope } from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';
import { buildApplicationGroupKey } from 'src/engine/core-modules/message-queue/utils/build-application-group-key.util';
import { buildWorkspaceGroupKey } from 'src/engine/core-modules/message-queue/utils/build-workspace-group-key.util';

const SYSTEM_GROUP_KEY = 'system';

const buildScopeGroupKeys = (scope: QueueJobScope): string[] => {
  if (scope.isSystemJob) {
    return [SYSTEM_GROUP_KEY];
  }

  if (scope.isWorkspaceJob) {
    return [buildWorkspaceGroupKey(scope.workspaceId)];
  }

  return [
    buildWorkspaceGroupKey(scope.workspaceId),
    buildApplicationGroupKey(scope.applicationUniversalIdentifier),
  ];
};

export const buildQueueJobGroupKeys = ({
  scope,
  additionalGroupKeys = [],
}: {
  scope: QueueJobScope;
  additionalGroupKeys?: string[];
}): string[] => [
  ...new Set([...buildScopeGroupKeys(scope), ...additionalGroupKeys]),
];
