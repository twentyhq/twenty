import { isDefined } from 'twenty-shared/utils';

import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type ApplicationTriggeredBy } from 'src/engine/core-modules/auth/types/application-triggered-by.type';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';

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

export const buildApplicationTriggeredByFromAuthContext = (
  authContext: WorkspaceAuthContext,
): ApplicationTriggeredBy | undefined =>
  isUserAuthContext(authContext)
    ? buildApplicationTriggeredBy({
        userId: authContext.user.id,
        userWorkspaceId: authContext.userWorkspaceId,
      })
    : undefined;
