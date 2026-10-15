import { type Request } from 'express';
import { isDefined } from 'twenty-shared/utils';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { buildApiKeyAuthContext } from 'src/engine/core-modules/auth/utils/build-api-key-auth-context.util';
import { buildApplicationAuthContext } from 'src/engine/core-modules/auth/utils/build-application-auth-context.util';
import { buildPendingActivationUserAuthContext } from 'src/engine/core-modules/auth/utils/build-pending-activation-user-auth-context.util';
import { buildUserAuthContext } from 'src/engine/core-modules/auth/utils/build-user-auth-context.util';

export const buildWorkspaceAuthContextFromRequest = (
  req: Request,
): WorkspaceAuthContext => {
  if (isDefined(req.apiKey)) {
    return buildApiKeyAuthContext({
      workspace: req.workspace!,
      apiKey: req.apiKey,
    });
  }

  if (
    isDefined(req.userWorkspaceId) &&
    isDefined(req.workspaceMemberId) &&
    isDefined(req.workspaceMember) &&
    isDefined(req.user)
  ) {
    return buildUserAuthContext({
      workspace: req.workspace!,
      userWorkspaceId: req.userWorkspaceId,
      user: req.user,
      workspaceMemberId: req.workspaceMemberId,
      workspaceMember: req.workspaceMember,
      application: req.application,
      agentId: req.agentId,
    });
  }

  if (isDefined(req.application)) {
    return buildApplicationAuthContext({
      workspace: req.workspace!,
      application: req.application,
      agentId: req.agentId,
    });
  }

  if (isDefined(req.userWorkspaceId) && isDefined(req.user)) {
    return buildPendingActivationUserAuthContext({
      workspace: req.workspace!,
      userWorkspaceId: req.userWorkspaceId,
      user: req.user,
    });
  }

  throw new AuthException(
    'No authentication context found',
    AuthExceptionCode.UNAUTHENTICATED,
  );
};
