import { isUndefined } from '@sniptt/guards';

import { getApplicationVariableValue } from 'src/logic-functions/utils/get-application-variable-value.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

import {
  DIRECTUS_API_KEY_ENV_VAR_NAME,
  DIRECTUS_URL_ENV_VAR_NAME,
} from 'src/constants/server-variable-names';

export type DirectusApiConfig = {
  url: string;
  apiKey: string;
};

export const getDirectusApiConfig = ():
  | {
      success: true;
      config: DirectusApiConfig;
    }
  | {
      success: false;
      reason: string;
    } => {
  const url = normalizeOptionalString(
    getApplicationVariableValue(DIRECTUS_URL_ENV_VAR_NAME),
  );
  const apiKey = normalizeOptionalString(
    getApplicationVariableValue(DIRECTUS_API_KEY_ENV_VAR_NAME),
  );

  if (isUndefined(url) || isUndefined(apiKey)) {
    return {
      success: false,
      reason:
        'DIRECTUS_URL and DIRECTUS_API_KEY server variables must both be set. A server admin must configure them before enabling Directus sync.',
    };
  }

  return {
    success: true,
    config: {
      url: url.replace(/\/+$/, ''),
      apiKey,
    },
  };
};

const normalizeOptionalString = (
  value: string | undefined,
): string | undefined => (isNonEmptyString(value) ? value.trim() : undefined);
