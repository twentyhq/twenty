import { type ExecutionContext, createParamDecorator } from '@nestjs/common';

import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { getRequest } from 'src/utils/extract-request';

export const FullAuthContext = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): AuthContext => {
    const request = getRequest(ctx);

    return {
      user: request.user,
      apiKey: request.apiKey,
      workspaceMemberId: request.workspaceMemberId,
      workspace: request.workspace,
      application: request.application,
      userWorkspaceId: request.userWorkspaceId,
      userWorkspace: request.userWorkspace,
      authProvider: request.authProvider,
      impersonationContext: request.impersonationContext,
    };
  },
);
