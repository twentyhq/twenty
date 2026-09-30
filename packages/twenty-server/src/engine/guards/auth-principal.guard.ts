import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
  mixin,
  type Type,
} from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { AUTH_PRINCIPAL_REFUSED_MESSAGE } from 'src/engine/guards/constants/auth-principal-refused-message.constant';
import { type AuthPrincipalGuardConfig } from 'src/engine/guards/types/auth-principal-guard-config.type';
import { classifyAuthPrincipal } from 'src/engine/guards/utils/classify-auth-principal.util';
import { getRequestOrThrowWhenUnauthenticated } from 'src/engine/guards/utils/get-request-or-throw-when-unauthenticated.util';
import { isAuthPrincipalVariantAccepted } from 'src/engine/guards/utils/is-auth-principal-variant-accepted.util';

export const AuthPrincipalGuard = (
  authPrincipalGuardConfig: AuthPrincipalGuardConfig,
): Type<CanActivate> => {
  @Injectable()
  class AuthPrincipalMixin implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
      const request = getRequestOrThrowWhenUnauthenticated(context);
      const authPrincipalVariant = isDefined(request)
        ? classifyAuthPrincipal(request)
        : undefined;

      if (
        isDefined(authPrincipalVariant) &&
        isAuthPrincipalVariantAccepted({
          authPrincipalGuardConfig,
          authPrincipalVariant,
        })
      ) {
        return true;
      }

      // A 403 on REST and FORBIDDEN on GraphQL, and unlike a GraphQL error thrown
      // from a guard, Nest does not log it as an unhandled exception.
      throw new ForbiddenException(AUTH_PRINCIPAL_REFUSED_MESSAGE);
    }
  }

  return mixin(AuthPrincipalMixin);
};
