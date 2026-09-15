import { type CanActivate, type ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { userCanServerImpersonate } from 'src/engine/core-modules/impersonation/utils/user-can-server-impersonate.util';

export class ServerLevelImpersonateGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;

    return userCanServerImpersonate(request.user);
  }
}
