import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import {
  kv,
  Response,
  type ServerRouteResolverResult,
} from 'twenty-sdk/logic-function';

import { FATHOM_WEBHOOK_CONNECTION_QUERY_PARAMETER } from 'src/constants/fathom.constant';
import {
  FATHOM_WEBHOOK_RESOLVER_UNIVERSAL_IDENTIFIER,
  FATHOM_WEBHOOK_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { getFathomConnectionClaimKey } from 'src/logic-functions/utils/get-fathom-connection-claim-key.util';

export const fathomWebhookResolverHandler = async (
  routePayload: RoutePayload<unknown>,
): Promise<ServerRouteResolverResult> => {
  const connectedAccountId =
    routePayload.queryStringParameters?.[
      FATHOM_WEBHOOK_CONNECTION_QUERY_PARAMETER
    ];

  if (!isNonEmptyString(connectedAccountId)) {
    return new Response(
      { error: 'Missing Fathom connection identifier' },
      { status: 400 },
    );
  }

  const workspaceId = await kv.get<string>(
    getFathomConnectionClaimKey(connectedAccountId),
    { scope: 'SERVER' },
  );

  if (!isNonEmptyString(workspaceId)) {
    return new Response(
      { error: 'Unknown Fathom connection' },
      { status: 404 },
    );
  }

  return {
    workspaceId,
    targetLogicFunctionUniversalIdentifier: FATHOM_WEBHOOK_UNIVERSAL_IDENTIFIER,
    payload: routePayload,
  };
};

export default defineLogicFunction({
  universalIdentifier: FATHOM_WEBHOOK_RESOLVER_UNIVERSAL_IDENTIFIER,
  name: 'fathom-webhook-resolver',
  description:
    'Routes a Fathom webhook delivery to the workspace that claimed the connection named in its query string.',
  timeoutSeconds: 15,
  handler: fathomWebhookResolverHandler,
  serverRouteTriggerSettings: {
    httpMethods: ['POST'],
    forwardedRequestHeaders: [
      'webhook-id',
      'webhook-timestamp',
      'webhook-signature',
    ],
  },
});
