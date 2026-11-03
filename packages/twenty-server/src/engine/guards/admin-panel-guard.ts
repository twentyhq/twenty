import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { userIsFullAdmin } from 'src/engine/core-modules/impersonation/utils/user-is-full-admin.util';
import { ServerAdminAccessService } from 'src/engine/core-modules/server-admin-access/services/server-admin-access.service';
import { isImpersonating } from 'src/engine/guards/utils/is-impersonating.util';

@Injectable()
export class AdminPanelGuard implements CanActivate {
  constructor(
    private readonly serverAdminAccessService: ServerAdminAccessService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = GqlExecutionContext.create(context).getContext().req;

    if (
      isImpersonating(request.impersonationContext) ||
      !userIsFullAdmin(request.user)
    ) {
      return false;
    }

    return this.serverAdminAccessService.isRequestAllowed(request);
  }
}
