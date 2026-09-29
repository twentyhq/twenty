import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { type LoginTokenJwtPayload } from 'src/engine/core-modules/auth/types/login-token-jwt-payload.type';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';

// Impersonation login tokens are only meant for getAuthTokensFromLoginToken,
// which mints a bounded impersonation session. Any other exchange would issue
// a regular session as the target, outside every impersonation check.
export const assertLoginTokenIsNotForImpersonation = (
  loginTokenPayload: Pick<LoginTokenJwtPayload, 'authProvider'>,
): void => {
  if (loginTokenPayload.authProvider === AuthProviderEnum.Impersonation) {
    throw new AuthException(
      'This operation cannot be performed with an impersonation login token',
      AuthExceptionCode.FORBIDDEN_EXCEPTION,
    );
  }
};
