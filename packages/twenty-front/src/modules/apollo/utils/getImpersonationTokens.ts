import { isDefined, parseJson } from 'twenty-shared/utils';
import { type AuthTokenPair } from '~/generated/graphql';
import { cookieStorage } from '~/utils/cookie-storage';

export const getImpersonationTokens = (): AuthTokenPair | undefined => {
  const raw = cookieStorage.getItem('impersonationTokenPair');
  if (!isDefined(raw)) {
    return;
  }

  const authTokenPair = parseJson<Partial<AuthTokenPair>>(raw);
  if (!isDefined(authTokenPair)) {
    cookieStorage.removeItem('impersonationTokenPair');
    return;
  }

  const access = authTokenPair.accessOrWorkspaceAgnosticToken;
  const refresh = authTokenPair.refreshToken;

  if (!isDefined(access) || !isDefined(refresh)) {
    cookieStorage.removeItem('impersonationTokenPair');
    return;
  }

  if (!isDefined(access.token) || !isDefined(access.expiresAt)) {
    cookieStorage.removeItem('impersonationTokenPair');
    return;
  }

  if (!isDefined(refresh.token) || !isDefined(refresh.expiresAt)) {
    cookieStorage.removeItem('impersonationTokenPair');
    return;
  }

  const result: AuthTokenPair = {
    accessOrWorkspaceAgnosticToken: {
      token: access.token,
      expiresAt: access.expiresAt,
    },
    refreshToken: {
      token: refresh.token,
      expiresAt: refresh.expiresAt,
    },
  };

  return result;
};
