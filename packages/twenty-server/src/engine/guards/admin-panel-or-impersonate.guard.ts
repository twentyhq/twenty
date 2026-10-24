import { type CanActivate, type ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { isDefined } from 'twenty-shared/utils';

import { userHasAdminPrivileges } from 'src/engine/core-modules/impersonation/utils/user-has-admin-privileges.util';

// Read-only admin-panel lookups (user/recent-users search) are available to
// full admins as well as impersonators: managing server-admin access requires
// finding users, and a full admin is the higher privilege.
export class AdminPanelOrImpersonateGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;

    return (
      !isDefined(request.impersonationContext) &&
      userHasAdminPrivileges(request.user)
    );
  }
}
