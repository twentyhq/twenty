import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';

export const parseOAuthState = <TState>(
  rawState: unknown,
): TState | undefined => {
  if (typeof rawState !== 'string') {
    return undefined;
  }

  try {
    return JSON.parse(rawState);
  } catch {
    throw new AuthException(
      'Invalid OAuth state',
      AuthExceptionCode.INVALID_INPUT,
    );
  }
};
