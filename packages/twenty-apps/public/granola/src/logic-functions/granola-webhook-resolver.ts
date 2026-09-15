import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import {
  kv,
  Response,
  type ServerRouteResolverResult,
} from 'twenty-sdk/logic-function';

import {
  GRANOLA_WEBHOOK_RESOLVER_UNIVERSAL_IDENTIFIER,
  GRANOLA_WEBHOOK_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { getGranolaRegistrationClaimKey } from 'src/logic-functions/utils/get-granola-registration-claim-key.util';

export const granolaWebhookResolverHandler = async (
  routePayload: RoutePayload<unknown>,
): Promise<ServerRouteResolverResult> => {
  const receivedAt = Date.now();
  const registrationId = routePayload.queryStringParameters?.registrationId;
  if (!isNonEmptyString(registrationId)) {
    return new Response(
      { error: 'Missing Granola registration identifier' },
      { status: 400 },
    );
  }
  const workspaceId = await kv.get<string>(
    getGranolaRegistrationClaimKey(registrationId),
    { scope: 'SERVER' },
  );
  if (!isNonEmptyString(workspaceId)) {
    return new Response(
      { error: 'Unknown Granola registration' },
      { status: 404 },
    );
  }
  return {
    workspaceId,
    targetLogicFunctionUniversalIdentifier:
      GRANOLA_WEBHOOK_UNIVERSAL_IDENTIFIER,
    payload: { routePayload, receivedAt },
  };
};

export default defineLogicFunction({
  universalIdentifier: GRANOLA_WEBHOOK_RESOLVER_UNIVERSAL_IDENTIFIER,
  name: 'granola-webhook-resolver',
  description: 'Routes signed Granola deliveries to the registered workspace.',
  timeoutSeconds: 15,
  handler: granolaWebhookResolverHandler,
  serverRouteTriggerSettings: {
    httpMethods: ['POST'],
    forwardedRequestHeaders: [
      'webhook-id',
      'webhook-timestamp',
      'webhook-signature',
    ],
  },
});
