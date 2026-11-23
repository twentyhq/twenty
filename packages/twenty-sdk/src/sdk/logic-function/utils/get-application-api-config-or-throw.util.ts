import { isNonEmptyString } from '@sniptt/guards';
import {
  DEFAULT_API_URL_NAME,
  DEFAULT_APP_ACCESS_TOKEN_NAME,
  DEFAULT_APP_APPLICATION_ACCESS_TOKEN_NAME,
  resolveApiUrlFromEnvironment,
} from 'twenty-shared/application-runtime';

import {
  getApplicationAccessToken,
  getCallerAccessToken,
} from '@/sdk/utils/get-application-access-token';

export const getApplicationApiConfigOrThrow = ({
  caller,
  isActingAsCaller = false,
}: {
  caller: string;
  isActingAsCaller?: boolean;
}): { apiUrl: string; accessToken: string } => {
  const apiUrl = resolveApiUrlFromEnvironment(process.env);
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
