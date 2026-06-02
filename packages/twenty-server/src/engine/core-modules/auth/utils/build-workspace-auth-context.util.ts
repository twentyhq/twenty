import { isDefined } from 'twenty-shared/utils';

import { type RawAuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { buildApiKeyAuthContext } from 'src/engine/core-modules/auth/utils/build-api-key-auth-context.util';
import { buildApplicationAuthContext } from 'src/engine/core-modules/auth/utils/build-application-auth-context.util';
import { buildPendingActivationUserAuthContext } from 'src/engine/core-modules/auth/utils/build-pending-activation-user-auth-context.util';
import { buildUserAuthContext } from 'src/engine/core-modules/auth/utils/build-user-auth-context.util';

export const buildWorkspaceAuthContext = (
  authContext: RawAuthContext,
): WorkspaceAuthContext | null => {
  if (!isDefined(authContext.workspace)) {
    return null;
  }

  if (isDefined(authContext.apiKey)) {
    return buildApiKeyAuthContext({
      workspace: authContext.workspace,
      apiKey: authContext.apiKey,
    });
  }

  if (
    isDefined(authContext.userWorkspaceId) &&
    isDefined(authContext.workspaceMemberId) &&
    isDefined(authContext.workspaceMember) &&
    isDefined(authContext.user)
  ) {
    return buildUserAuthContext({
      workspace: authContext.workspace,
      userWorkspaceId: authContext.userWorkspaceId,
      user: authContext.user,
      workspaceMemberId: authContext.workspaceMemberId,
      workspaceMember: authContext.workspaceMember,
    });
  }

  if (isDefined(authContext.application)) {
    return buildApplicationAuthContext({
      workspace: authContext.workspace,
      application: authContext.application,
    });
  }

  if (isDefined(authContext.userWorkspaceId) && isDefined(authContext.user)) {
    return buildPendingActivationUserAuthContext({
      workspace: authContext.workspace,
      userWorkspaceId: authContext.userWorkspaceId,
      user: authContext.user,
    });
  }

  return null;
};
