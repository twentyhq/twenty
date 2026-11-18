import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { hasServerAdminAccess } from 'src/engine/guards/utils/has-server-admin-access.util';

// Read-only admin-panel lookups (user/recent-users search) are available to
// full admins as well as impersonators: managing server-admin access requires
// finding users, and a full admin is the higher privilege.
@Injectable()
export class AdminPanelOrImpersonateGuard implements CanActivate {
  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);

    return hasServerAdminAccess({
      authContext: ctx.getContext().req,
      serverAdminWorkspaceId: this.twentyConfigService.get(
        'SERVER_ADMIN_WORKSPACE_ID',
      ),
    });
  }
}
