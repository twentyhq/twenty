import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { userHasAdminPrivileges } from 'src/engine/core-modules/impersonation/utils/user-has-admin-privileges.util';
import { ServerAdminAccessService } from 'src/engine/core-modules/server-admin-access/services/server-admin-access.service';
import { isImpersonating } from 'src/engine/guards/utils/is-impersonating.util';

// Read-only admin-panel lookups (user/recent-users search) are available to
// full admins as well as impersonators: managing server-admin access requires
// finding users, and a full admin is the higher privilege.
@Injectable()
export class AdminPanelOrImpersonateGuard implements CanActivate {
  constructor(
    private readonly serverAdminAccessService: ServerAdminAccessService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = GqlExecutionContext.create(context).getContext().req;

    if (
      isImpersonating(request.impersonationContext) ||
      !userHasAdminPrivileges(request.user)
    ) {
      return false;
    }

    return this.serverAdminAccessService.isRequestAllowed(request);
  }
}
