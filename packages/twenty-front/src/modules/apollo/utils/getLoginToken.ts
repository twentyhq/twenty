import { cookieStorage } from '~/utils/cookie-storage';
import { isDefined } from 'twenty-shared/utils';
import { AuthToken } from '~/generated/graphql';

export const getLoginToken = () => {
  const loginToken = cookieStorage.getItem('loginToken');
  return isDefined(loginToken)
    ? (JSON.parse(loginToken) as AuthToken['token'])
    : undefined;
};
