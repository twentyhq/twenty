/* @license Enterprise */

import { isApiKeyAuthContext } from 'src/engine/core-modules/auth/guards/is-api-key-auth-context.guard';
import { isApplicationAuthContext } from 'src/engine/core-modules/auth/guards/is-application-auth-context.guard';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type UsageSpenders } from 'src/engine/core-modules/usage/types/usage-spenders.type';

export const buildUsageSpendersFromAuthContext = (
  authContext: WorkspaceAuthContext,
): UsageSpenders => {
  if (isApiKeyAuthContext(authContext)) {
    return { apiKeyId: authContext.apiKey.id };
  }

  if (isApplicationAuthContext(authContext)) {
    return { applicationId: authContext.application.id };
  }

  if (isUserAuthContext(authContext)) {
    return {
      userWorkspaceId: authContext.userWorkspaceId,
      applicationId:
        authContext.application?.id ?? authContext.viaApplication?.id,
    };
  }

  return {};
};
