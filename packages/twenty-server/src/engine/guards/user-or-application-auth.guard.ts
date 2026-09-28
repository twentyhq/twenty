import { type CanActivate, type ExecutionContext } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { getRequestOrThrowWhenUnauthenticated } from 'src/engine/guards/utils/get-request-or-throw-when-unauthenticated.util';

export class UserOrApplicationAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = getRequestOrThrowWhenUnauthenticated(context);

    if (!request) {
      return false;
    }

    return isDefined(request.user) || isDefined(request.application);
  }
}
