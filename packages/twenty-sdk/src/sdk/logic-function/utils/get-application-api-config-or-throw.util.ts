import { isNonEmptyString } from '@sniptt/guards';
import {
  DEFAULT_API_URL_NAME,
  DEFAULT_APP_ACCESS_TOKEN_NAME,
  DEFAULT_APP_APPLICATION_ACCESS_TOKEN_NAME,
} from 'twenty-shared/application-runtime';

import {
  getApplicationAccessToken,
  getCallerAccessToken,
} from '@/sdk/utils/get-application-access-token';

export const getApplicationApiConfigOrThrow = (
  caller: string,
  { isActingAsCaller = false }: { isActingAsCaller?: boolean } = {},
): { apiUrl: string; accessToken: string } => {
  const apiUrl = process.env[DEFAULT_API_URL_NAME];
  const accessToken = isActingAsCaller
    ? getCallerAccessToken()
    : getApplicationAccessToken();

  if (!isNonEmptyString(apiUrl) || !isNonEmptyString(accessToken)) {
    throw new Error(
      `${caller}() requires the app runtime env vars ` +
        `${DEFAULT_API_URL_NAME} and ${DEFAULT_APP_APPLICATION_ACCESS_TOKEN_NAME} ` +
        `(or ${DEFAULT_APP_ACCESS_TOKEN_NAME}).`,
    );
  }

  return { apiUrl, accessToken };
};
