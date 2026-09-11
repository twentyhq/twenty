import { isNonEmptyString } from '@sniptt/guards';

import { GRANOLA_API_KEY_ENV_VAR_NAME } from 'src/logic-functions/constants/granola-api-key-env-var-name';

export const isGranolaApiKeySet = (): boolean =>
  isNonEmptyString(process.env[GRANOLA_API_KEY_ENV_VAR_NAME]?.trim());
