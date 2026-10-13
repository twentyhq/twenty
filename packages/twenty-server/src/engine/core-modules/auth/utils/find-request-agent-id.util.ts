import { isDefined } from 'twenty-shared/utils';

import { isApplicationAuthContext } from 'src/engine/core-modules/auth/guards/is-application-auth-context.guard';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { workspaceAuthContextStorage } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';

// The agent belongs to the request's token, so it only narrows checks about the token's own user or application
export const findRequestAgentId = ({
  userWorkspaceId,
  apiKeyId,
  applicationId,
}: {
  userWorkspaceId?: string;
  apiKeyId?: string;
  applicationId: string | undefined;
}): string | undefined => {
  const authContext = workspaceAuthContextStorage.getStore();

  if (
    isDefined(apiKeyId) ||
    !isDefined(authContext) ||
    !(isUserAuthContext(authContext) || isApplicationAuthContext(authContext))
  ) {
    return undefined;
  }

  const isAboutTokenPrincipal = isDefined(userWorkspaceId)
    ? isUserAuthContext(authContext) &&
      authContext.userWorkspaceId === userWorkspaceId
    : isDefined(applicationId) && authContext.application?.id === applicationId;

  return isAboutTokenPrincipal ? authContext.agentId : undefined;
};
