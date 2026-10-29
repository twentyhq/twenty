import { isNonEmptyString } from '@sniptt/guards';
import { DEFAULT_SERVER_ROUTES_URL_NAME } from 'twenty-shared/application-runtime';

export const getServerRouteUrl = (
  logicFunctionUniversalIdentifier: string,
): string => {
  const serverRoutesUrl = process.env[DEFAULT_SERVER_ROUTES_URL_NAME];

  if (!isNonEmptyString(serverRoutesUrl)) {
    throw new Error(
      'getServerRouteUrl can only be called from within a logic function of an application',
    );
  }

  return `${serverRoutesUrl}/${logicFunctionUniversalIdentifier}`;
};
