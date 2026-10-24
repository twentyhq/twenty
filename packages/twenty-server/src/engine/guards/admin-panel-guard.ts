import { type CanActivate, type ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { type Observable } from 'rxjs';

import { userIsFullAdmin } from 'src/engine/core-modules/impersonation/utils/user-is-full-admin.util';
import { isImpersonating } from 'src/engine/guards/utils/is-impersonating.util';

export class AdminPanelGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;

    return (
      !isImpersonating(request.impersonationContext) &&
      userIsFullAdmin(request.user)
    );
  }
}
