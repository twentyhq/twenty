import { isDefined } from 'twenty-shared/utils';

import { type ApplicationTriggeredBy } from 'src/engine/core-modules/auth/types/application-triggered-by.type';

export const buildApplicationTriggeredBy = ({
  userId,
  userWorkspaceId,
}: {
  userId?: string | null;
  userWorkspaceId?: string | null;
}): ApplicationTriggeredBy | undefined => {
  if (!isDefined(userId) || !isDefined(userWorkspaceId)) {
    return undefined;
  }

  return { userId, userWorkspaceId };
};
