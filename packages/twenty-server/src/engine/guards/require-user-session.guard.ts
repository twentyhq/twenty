import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { type GqlContextType } from '@nestjs/graphql';

import { getRequestOrThrowWhenUnauthenticated } from 'src/engine/guards/utils/get-request-or-throw-when-unauthenticated.util';
import {
  buildUserSessionRequiredError,
  isUserSessionPrincipal,
} from 'src/engine/guards/utils/is-user-session-principal.util';

@Injectable()
export class RequireUserSessionGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = getRequestOrThrowWhenUnauthenticated(context);

    if (!request) {
      return false;
    }

    if (isUserSessionPrincipal(request)) {
      return true;
    }

    if (context.getType<GqlContextType>() === 'graphql') {
      throw buildUserSessionRequiredError();
    }

    return false;
  }
}
