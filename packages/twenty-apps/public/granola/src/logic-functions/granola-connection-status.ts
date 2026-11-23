import { defineLogicFunction } from 'twenty-sdk/define';
import { RetryableLogicFunctionError } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { GRANOLA_CONNECTION_STATUS_ROUTE_PATH } from 'src/constants/granola-connection-status-route-path';
import { GRANOLA_CONNECTION_STATUS_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { GranolaApiError } from 'src/logic-functions/types/granola-api-error';
import { createWorkspaceGranolaClientOrThrow } from 'src/logic-functions/utils/create-workspace-granola-client-or-throw.util';
import { findGranolaRegistrationForCurrentKey } from 'src/logic-functions/utils/find-granola-registration-for-current-key.util';
import { isGranolaApiKeySet } from 'src/logic-functions/utils/is-granola-api-key-set.util';

export const granolaConnectionStatusHandler = async () => {
  if (!isGranolaApiKeySet()) {
    return { isConnected: false, isApiKeySet: false };
  }
  const client = createWorkspaceGranolaClientOrThrow();
  const [keyCheck, endpointList] = await Promise.allSettled([
    client.listFolders({ page_size: 1 }),
    client.listWebhookEndpoints(),
  ]);

  if (keyCheck.status === 'rejected') {
    const error = keyCheck.reason;

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

  if (endpointList.status === 'rejected') {
    const error = endpointList.reason;

    if (error instanceof GranolaApiError) {
      return {
        isConnected: true,
        isApiKeySet: true,
        needsRegistration: true,
        error: error.message,
      };
    }
    throw error;
  }

  const registration = await findGranolaRegistrationForCurrentKey();
  const endpoint = endpointList.value.webhook_endpoints.find(
    (candidate) => candidate.id === registration?.webhookEndpointId,
  );

  if (!isDefined(endpoint)) {
    return {
      isConnected: true,
      isApiKeySet: true,
      needsRegistration: true,
    };
  }

  return {
    isConnected: true,
    isApiKeySet: true,
    registration: { scopes: endpoint.scopes, isActive: endpoint.enabled },
  };
};

export default defineLogicFunction({
  universalIdentifier: GRANOLA_CONNECTION_STATUS_UNIVERSAL_IDENTIFIER,
  name: 'granola-connection-status',
  description: 'Checks the saved Granola API key and the live webhook status.',
  timeoutSeconds: 60,
  handler: granolaConnectionStatusHandler,
  httpRouteTriggerSettings: {
    path: GRANOLA_CONNECTION_STATUS_ROUTE_PATH,
    httpMethod: 'GET',
    isAuthRequired: true,
  },
});
