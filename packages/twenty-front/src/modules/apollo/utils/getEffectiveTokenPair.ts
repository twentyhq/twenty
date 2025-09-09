import { isDefined } from 'twenty-shared/utils';
import { type AuthTokenPair } from '~/generated/graphql';
import { cookieStorage } from '~/utils/cookie-storage';
import { getTokenPair } from './getTokenPair';

const getImpersonationTokenPair = (): AuthTokenPair | undefined => {
  const raw = cookieStorage.getItem('impersonationTokenPair');
  if (!isDefined(raw)) {
    return undefined;
  }

  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch {
    cookieStorage.removeItem('impersonationTokenPair');
    return undefined;
  }

  const isValid =
    parsed &&
    typeof parsed === 'object' &&
    isDefined(parsed.accessOrWorkspaceAgnosticToken) &&
    typeof parsed.accessOrWorkspaceAgnosticToken.token === 'string';

  if (!isValid) {
    cookieStorage.removeItem('impersonationTokenPair');
    return undefined;
  }

  return parsed as AuthTokenPair;
};

export const getEffectiveTokenPair = (): AuthTokenPair | undefined => {
  return getImpersonationTokenPair() ?? getTokenPair();
};

export const isImpersonating = (): boolean => {
  return Boolean(getImpersonationTokenPair());
};
