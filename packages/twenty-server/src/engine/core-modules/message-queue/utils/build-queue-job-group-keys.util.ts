import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';

import { type QueueJobScope } from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';
import { buildApplicationGroupKey } from 'src/engine/core-modules/message-queue/utils/build-application-group-key.util';
import { buildWorkspaceGroupKey } from 'src/engine/core-modules/message-queue/utils/build-workspace-group-key.util';

const SYSTEM_GROUP_KEY = 'system';

// The standard application gets no group key: a clock shared by every
// workspace's core jobs would turn them into a single FIFO line
export const buildQueueJobGroupKeys = (scope: QueueJobScope): string[] => {
  if (scope.isSystemJob === true) {
    return [SYSTEM_GROUP_KEY];
  }

  const { workspaceId, applicationUniversalIdentifier } = scope;

  return applicationUniversalIdentifier ===
    TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER
    ? [buildWorkspaceGroupKey(workspaceId)]
    : [
        buildWorkspaceGroupKey(workspaceId),
        buildApplicationGroupKey(applicationUniversalIdentifier),
      ];
};
