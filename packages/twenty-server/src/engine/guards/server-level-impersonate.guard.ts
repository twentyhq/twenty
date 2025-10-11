import { type CanActivate, type ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export class ServerLevelImpersonateGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;

    return request.user.canImpersonate === true;
  }
}
