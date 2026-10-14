import { assertUnreachable, isDefined } from 'twenty-shared/utils';

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

  if (isDefined(apiKeyId) || !isDefined(authContext)) {
    return undefined;
  }

  switch (authContext.type) {
    case 'user': {
      const isAboutTokenPrincipal = isDefined(userWorkspaceId)
        ? authContext.userWorkspaceId === userWorkspaceId
        : isDefined(applicationId) &&
          authContext.application?.id === applicationId;

      return isAboutTokenPrincipal ? authContext.agentId : undefined;
    }
    case 'application':
      return !isDefined(userWorkspaceId) &&
        authContext.application.id === applicationId
        ? authContext.agentId
        : undefined;
    case 'apiKey':
    case 'system':
    case 'pendingActivationUser':
      return undefined;
    default:
      return assertUnreachable(authContext);
  }
};
