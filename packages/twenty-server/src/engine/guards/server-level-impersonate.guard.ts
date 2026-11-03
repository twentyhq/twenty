import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { userCanServerImpersonate } from 'src/engine/core-modules/impersonation/utils/user-can-server-impersonate.util';
import { ServerAdminAccessService } from 'src/engine/core-modules/server-admin-access/services/server-admin-access.service';
import { isImpersonating } from 'src/engine/guards/utils/is-impersonating.util';

@Injectable()
export class ServerLevelImpersonateGuard implements CanActivate {
  constructor(
    private readonly serverAdminAccessService: ServerAdminAccessService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = GqlExecutionContext.create(context).getContext().req;

    if (
      isImpersonating(request.impersonationContext) ||
      !userCanServerImpersonate(request.user)
    ) {
      return false;
    }

    return this.serverAdminAccessService.isRequestAllowed({
      request,
      userEmail: request.user.email,
    });
  }
}
