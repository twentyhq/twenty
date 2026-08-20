import { isDefined } from 'twenty-shared/utils';

import { type ApplicationTriggeredBy } from 'src/engine/core-modules/auth/types/application-triggered-by.type';

// A token bound to a user is already scoped to that person, so it identifies
// the trigger just as well as the claim does.
export const resolveApplicationTriggeredBy = ({
  applicationTriggeredBy,
  tokenUserId,
  tokenUserWorkspaceId,
}: {
  applicationTriggeredBy?: ApplicationTriggeredBy;
  tokenUserId?: string;
  tokenUserWorkspaceId?: string;
}): ApplicationTriggeredBy | undefined => {
  if (isDefined(applicationTriggeredBy)) {
    return applicationTriggeredBy;
  }

  if (!isDefined(tokenUserId) || !isDefined(tokenUserWorkspaceId)) {
    return undefined;
  }

  return { userId: tokenUserId, userWorkspaceId: tokenUserWorkspaceId };
};
