import { type CanActivate, type ExecutionContext } from '@nestjs/common';
import { type GqlContextType } from '@nestjs/graphql';

import { msg } from '@lingui/core/macro';
import { type Observable } from 'rxjs';

import { AuthExceptionCode } from 'src/engine/core-modules/auth/auth.exception';
import { AuthenticationError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { hasAuthenticatedPrincipal } from 'src/engine/utils/has-authenticated-principal.util';
import { getRequest } from 'src/utils/extract-request';

export class UserAuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = getRequest(context);

    if (!request) {
      return false;
    }

    // Same split as WorkspaceAuthGuard: returning false here reports FORBIDDEN,
    // which clients read as a permission problem and never recover from, so a
    // request nothing authenticated has to say UNAUTHENTICATED instead. GraphQL
    // only, since the catch-all filter turns a GraphQL error thrown on the REST
    // path into a 500.
    if (
      !hasAuthenticatedPrincipal(request) &&
      context.getType<GqlContextType>() === 'graphql'
    ) {
      throw new AuthenticationError('Missing authentication token', {
        subCode: AuthExceptionCode.UNAUTHENTICATED,
        userFriendlyMessage: msg`You must be authenticated to perform this action.`,
      });
    }

    return request.user !== undefined;
  }
}
