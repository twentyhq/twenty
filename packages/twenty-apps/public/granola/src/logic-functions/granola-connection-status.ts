import { defineLogicFunction } from 'twenty-sdk/define';
import { RetryableLogicFunctionError } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { GRANOLA_CONNECTION_STATUS_ROUTE_PATH } from 'src/constants/granola-connection-status-route-path';
import { GRANOLA_CONNECTION_STATUS_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { GranolaApiError } from 'src/logic-functions/types/granola-api-error';
import { createGranolaClientOrThrow } from 'src/logic-functions/utils/create-granola-client-or-throw.util';
import { currentUserCanManageGranolaOrThrow } from 'src/logic-functions/utils/current-user-can-manage-granola-or-throw.util';
import { findGranolaRegistrationForCurrentKey } from 'src/logic-functions/utils/find-granola-registration-for-current-key.util';
import { isGranolaApiKeySet } from 'src/logic-functions/utils/is-granola-api-key-set.util';

export const granolaConnectionStatusHandler = async () => {
  if (!isGranolaApiKeySet()) {
    return { isConnected: false, isApiKeySet: false };
  }
  const client = createGranolaClientOrThrow();
  try {
    await client.listFolders({ page_size: 1 });
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
  const canManage = await currentUserCanManageGranolaOrThrow();
  try {
    const { webhook_endpoints: endpoints } =
      await client.listWebhookEndpoints();
    const registration = await findGranolaRegistrationForCurrentKey();
    const endpoint = endpoints.find(
      (candidate) => candidate.id === registration?.webhookEndpointId,
    );
    if (!isDefined(endpoint)) {
      return {
        isConnected: true,
        isApiKeySet: true,
        canManage,
        needsRegistration: true,
      };
    }
    return {
      isConnected: true,
      isApiKeySet: true,
      canManage,
      registration: { scopes: endpoint.scopes, isActive: endpoint.enabled },
    };
  } catch (error) {
    if (error instanceof GranolaApiError) {
      return {
        isConnected: true,
        isApiKeySet: true,
        canManage,
        needsRegistration: true,
        error: error.message,
      };
    }
    throw error;
  }
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
