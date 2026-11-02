import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import {
  kv,
  Response,
  type ServerRouteResolverResult,
} from 'twenty-sdk/logic-function';

import {
  LINKEDIN_HANDLE_WEBHOOK_EVENT_UNIVERSAL_IDENTIFIER,
  LINKEDIN_WEBHOOK_RESOLVER_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { type UnipileWebhookEvent } from 'src/unipile/types/unipile-webhook-event.type';
import { getUnipileAccountClaimKey } from 'src/unipile/utils/get-unipile-account-claim-key.util';
import { verifyUnipileWebhookSignature } from 'src/unipile/utils/verify-unipile-webhook-signature.util';

export const linkedinWebhookResolverHandler = async (
  routePayload: RoutePayload<UnipileWebhookEvent>,
): Promise<ServerRouteResolverResult> => {
  const secret = process.env.UNIPILE_WEBHOOK_SECRET;

  if (!isNonEmptyString(secret)) {
    return new Response(
      { error: 'UNIPILE_WEBHOOK_SECRET is not configured' },
      { status: 500 },
    );
  }

  const isSignatureValid = verifyUnipileWebhookSignature({
    signatureHeader: routePayload.headers['unipile-signature'],
    rawBody: routePayload.rawBody,
    secret,
  });

  if (!isSignatureValid) {
    return new Response({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = routePayload.body;

  if (event?.account_provider !== 'linkedin') {
    return new Response({ skipped: 'Not a LinkedIn event' });
  }

  const workspaceId = await kv.get<string>(
    getUnipileAccountClaimKey(event.account_id),
    { scope: 'SERVER' },
  );

  if (!isNonEmptyString(workspaceId)) {
    return new Response({ skipped: 'No workspace claims this account' });
  }

  return {
    workspaceId,
    targetLogicFunctionUniversalIdentifier:
      LINKEDIN_HANDLE_WEBHOOK_EVENT_UNIVERSAL_IDENTIFIER,
    payload: event,
  };
};

export default defineLogicFunction({
  universalIdentifier: LINKEDIN_WEBHOOK_RESOLVER_UNIVERSAL_IDENTIFIER,
  name: 'linkedin-webhook-resolver',
  description:
    'Verifies Unipile webhook deliveries and routes each one to the workspace that connected the LinkedIn account.',
  timeoutSeconds: 15,
  handler: linkedinWebhookResolverHandler,
  serverRouteTriggerSettings: {
    httpMethods: ['POST'],
    forwardedRequestHeaders: ['unipile-signature'],
  },
});
