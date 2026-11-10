import { defineLogicFunction } from 'twenty-sdk/define';
import {
  findConnectionForRequest,
  listConnections,
  reportConnectionAuthFailure,
  type RoutePayload,
} from 'twenty-sdk/logic-function';

import { ACME_PROVIDER_NAME, ACME_WHOAMI_URL } from 'src/constants/acme';
import { GET_ACME_PROFILE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

const handler = async (event: RoutePayload) => {
  const connections = await listConnections({
    providerName: ACME_PROVIDER_NAME,
  });
  const connection = findConnectionForRequest(connections, event);

  if (connection === null) {
    return { connected: false };
  }

  const response = await fetch(ACME_WHOAMI_URL, {
    headers: { Authorization: `Bearer ${connection.accessToken}` },
  });

  // A revoked key flags the connection so the user sees "Reconnect" in settings.
  if (response.status === 401) {
    await reportConnectionAuthFailure({
      connectionId: connection.id,
      reason: 'Acme rejected the API key',
    });

    return { connected: false };
  }

  return {
    connected: true,
    handle: connection.handle,
    profile: await response.json(),
  };
};

export default defineLogicFunction({
  universalIdentifier: GET_ACME_PROFILE_UNIVERSAL_IDENTIFIER,
  name: 'get-acme-profile',
  description: "Calls Acme with the requesting user's API key",
  timeoutSeconds: 10,
  handler,
  httpRouteTriggerSettings: {
    path: '/acme/profile',
    httpMethod: 'GET',
    isAuthRequired: true,
  },
});
