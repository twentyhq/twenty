import { isDefined } from 'twenty-shared/utils';
import { AuthTokenPair } from '~/generated/graphql';
import { cookieStorage } from '~/utils/cookie-storage';

const isValidAuthTokenPair = (tokenPair: any): tokenPair is AuthTokenPair => {
  return (
    tokenPair &&
    typeof tokenPair === 'object' &&
    tokenPair.accessOrWorkspaceAgnosticToken &&
    typeof tokenPair.accessOrWorkspaceAgnosticToken === 'object' &&
    typeof tokenPair.accessOrWorkspaceAgnosticToken.token === 'string'
  );
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
