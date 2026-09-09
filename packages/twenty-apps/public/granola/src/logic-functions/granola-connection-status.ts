import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import { RetryableLogicFunctionError } from 'twenty-sdk/logic-function';

import { GRANOLA_CONNECTION_STATUS_ROUTE_PATH } from 'src/constants/granola-connection-status-route-path';
import { GRANOLA_CONNECTION_STATUS_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { GRANOLA_API_KEY_ENV_VAR_NAME } from 'src/logic-functions/constants/granola-api-key-env-var-name';
import { GranolaApiError } from 'src/logic-functions/types/granola-api-error';
import { createGranolaClientOrThrow } from 'src/logic-functions/utils/create-granola-client-or-throw.util';

export const granolaConnectionStatusHandler = async () => {
  if (!isNonEmptyString(process.env[GRANOLA_API_KEY_ENV_VAR_NAME]?.trim())) {
    return { isConnected: false, isApiKeySet: false };
  }
  try {
    await createGranolaClientOrThrow().listFolders({ page_size: 1 });
    return { isConnected: true, isApiKeySet: true };
  } catch (error) {
    if (error instanceof GranolaApiError) {
      return { isConnected: false, isApiKeySet: true, error: error.message };
    }
    if (error instanceof RetryableLogicFunctionError) {
      return {
        isConnected: false,
        isApiKeySet: true,
        isGranolaReachable: false,
        error: error.message,
      };
    }
    throw error;
  }
};

export default defineLogicFunction({
  universalIdentifier: GRANOLA_CONNECTION_STATUS_UNIVERSAL_IDENTIFIER,
  name: 'granola-connection-status',
  description: 'Checks the saved Granola API key.',
  timeoutSeconds: 60,
  handler: granolaConnectionStatusHandler,
  httpRouteTriggerSettings: {
    path: GRANOLA_CONNECTION_STATUS_ROUTE_PATH,
    httpMethod: 'GET',
    isAuthRequired: true,
  },
});
