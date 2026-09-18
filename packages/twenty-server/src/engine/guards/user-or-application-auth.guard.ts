import { type CanActivate, type ExecutionContext } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { getRequestOrThrowWhenUnauthenticated } from 'src/engine/guards/utils/get-request-or-throw-when-unauthenticated.util';

// Bundled applications authenticate with an APPLICATION_ACCESS token that
// carries no user when nothing human triggered the run (install hooks, crons).
// SettingsPermissionGuard still resolves the application's own role, so the
// permission flag is enforced for both principals.
export class UserOrApplicationAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = getRequestOrThrowWhenUnauthenticated(context);

    if (!request) {
      return false;
    }

    return isDefined(request.user) || isDefined(request.application);
  }
}
