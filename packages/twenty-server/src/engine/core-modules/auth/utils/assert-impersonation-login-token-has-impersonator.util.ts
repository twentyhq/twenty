import { isNonEmptyString } from '@sniptt/guards';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { type LoginTokenJwtPayload } from 'src/engine/core-modules/auth/types/login-token-jwt-payload.type';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';

// TypeORM ignores an undefined where value, so a missing id has to be caught before the lookup
export const assertImpersonationLoginTokenHasImpersonator = (
  loginTokenPayload: Pick<
    LoginTokenJwtPayload,
    'authProvider' | 'impersonatorUserWorkspaceId'
  >,
): void => {
  if (
    loginTokenPayload.authProvider === AuthProviderEnum.Impersonation &&
    !isNonEmptyString(loginTokenPayload.impersonatorUserWorkspaceId)
  ) {
    throw new AuthException(
      'Impersonation login token is missing its impersonator',
      AuthExceptionCode.FORBIDDEN_EXCEPTION,
    );
  }
};
