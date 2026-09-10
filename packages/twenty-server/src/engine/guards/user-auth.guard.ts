import { type CanActivate, type ExecutionContext } from '@nestjs/common';

import { type Observable } from 'rxjs';

import { getRequestOrThrowWhenUnauthenticated } from 'src/engine/guards/utils/get-request-or-throw-when-unauthenticated.util';

export class UserAuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = getRequestOrThrowWhenUnauthenticated(context);

    if (!request) {
      return false;
    }

    return request.user !== undefined;
  }
}
