import { isDefined } from 'twenty-shared/utils';
import { type AuthTokenPair } from '~/generated/graphql';
import { cookieStorage } from '~/utils/cookie-storage';
import { isValidAuthTokenPair } from './isValidAuthTokenPair';

export const getTokenPair = (): AuthTokenPair | undefined => {
  const stringTokenPair = cookieStorage.getItem('tokenPair');

  if (!isDefined(stringTokenPair)) {
    // eslint-disable-next-line no-console
    console.log('tokenPair is undefined');

    return undefined;
  }

  try {
    const parsedTokenPair = JSON.parse(stringTokenPair);

    if (!isValidAuthTokenPair(parsedTokenPair)) {
      cookieStorage.removeItem('tokenPair');
      return undefined;
    }

    return parsedTokenPair;
  } catch {
    cookieStorage.removeItem('tokenPair');
    return undefined;
  }
};
