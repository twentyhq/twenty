import { isDefined } from 'twenty-shared/utils';
import { AuthTokenPair } from '~/generated/graphql';
import { cookieStorage } from '~/utils/cookie-storage';

const isValidAuthTokenPair = (
  tokenPair: unknown,
): tokenPair is AuthTokenPair => {
  if (!tokenPair || typeof tokenPair !== 'object' || tokenPair === null) {
    return false;
  }

  if (!('accessOrWorkspaceAgnosticToken' in tokenPair)) {
    return false;
  }

  const accessToken = (tokenPair as Record<string, unknown>)
    .accessOrWorkspaceAgnosticToken;

  if (!accessToken || typeof accessToken !== 'object' || accessToken === null) {
    return false;
  }

  if (!('token' in accessToken)) {
    return false;
  }

  return typeof (accessToken as Record<string, unknown>).token === 'string';
};

export const getTokenPair = (): AuthTokenPair | undefined => {
  const stringTokenPair = cookieStorage.getItem('tokenPair');

  if (!isDefined(stringTokenPair)) {
    return undefined;
  }

  try {
    const parsedTokenPair = JSON.parse(stringTokenPair);

    if (!isValidAuthTokenPair(parsedTokenPair)) {
      cookieStorage.removeItem('tokenPair');
      return undefined;
    }

    return parsedTokenPair;
  } catch (error) {
    cookieStorage.removeItem('tokenPair');
    return undefined;
  }
};
