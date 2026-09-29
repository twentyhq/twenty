import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { type LoginTokenJwtPayload } from 'src/engine/core-modules/auth/types/login-token-jwt-payload.type';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';

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
