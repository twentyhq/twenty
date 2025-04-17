import { cookieStorage } from '~/utils/cookie-storage';
import { isDefined } from 'twenty-shared/utils';
import { AuthTokenPair } from '~/generated/graphql';

export const getTokenPair = () => {
  const stringTokenPair = cookieStorage.getItem('tokenPair');
  return isDefined(stringTokenPair)
    ? (JSON.parse(stringTokenPair) as AuthTokenPair)
    : undefined;
};
