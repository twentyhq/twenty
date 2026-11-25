import { type ExecutionContext, createParamDecorator } from '@nestjs/common';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { buildWorkspaceAuthContextFromRequest } from 'src/engine/core-modules/auth/utils/build-workspace-auth-context-from-request.util';
import { getRequest } from 'src/utils/extract-request';

export const AuthContext = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): WorkspaceAuthContext =>
    buildWorkspaceAuthContextFromRequest(getRequest(ctx)),
);
