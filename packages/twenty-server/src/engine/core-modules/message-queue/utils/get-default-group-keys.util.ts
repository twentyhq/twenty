import { isNonEmptyString } from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';

import { buildWorkspaceGroupKey } from 'src/engine/core-modules/message-queue/utils/build-workspace-group-key.util';

const SYSTEM_GROUP_KEY = 'system';

export const getDefaultGroupKeys = (jobData: unknown): string[] => {
  const workspaceId = isPlainObject(jobData) ? jobData.workspaceId : undefined;

  return isNonEmptyString(workspaceId)
    ? [buildWorkspaceGroupKey(workspaceId)]
    : [SYSTEM_GROUP_KEY];
};
