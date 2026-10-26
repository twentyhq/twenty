import { type CanActivate, type ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { userCanServerImpersonate } from 'src/engine/core-modules/impersonation/utils/user-can-server-impersonate.util';
import { isImpersonating } from 'src/engine/guards/utils/is-impersonating.util';

export class ServerLevelImpersonateGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;

    return (
      !isImpersonating(request.impersonationContext) &&
      userCanServerImpersonate(request.user)
    );
  }
}
