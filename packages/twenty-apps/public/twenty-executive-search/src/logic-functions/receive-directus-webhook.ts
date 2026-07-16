import { isNull, isUndefined } from '@sniptt/guards';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';

import { DIRECTUS_WEBHOOK_SECRET_ENV_VAR_NAME } from 'src/constants/directus-webhook-secret-env-var-name';
import { PROCESS_DIRECTUS_WEBHOOK_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/process-directus-webhook-logic-function-universal-identifier';
import { RECEIVE_DIRECTUS_WEBHOOK_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/receive-directus-webhook-logic-function-universal-identifier';
import { verifyDirectusWebhookSignature } from 'src/logic-functions/directus-api/verify-directus-webhook-signature.util';
import { getApplicationVariableValue } from 'src/logic-functions/utils/get-application-variable-value.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

export type DirectusWebhookEnvelope = {
  event?: string;
  collection?: string;
  key?: string;
  id?: string | number;
  data?: Record<string, unknown>;
  workspace_key?: string;
};

type DirectusWebhookResolverResult = {
  workspaceId: string;
  targetLogicFunctionUniversalIdentifier: string;
  payload: DirectusWebhookEnvelope;
  headers: Record<string, string | undefined>;
};

// A thrown error becomes a non-2xx, which makes Directus retry; a returned result dispatches to the processor.
export const receiveDirectusWebhookHandler = (
  routePayload: RoutePayload<DirectusWebhookEnvelope>,
): DirectusWebhookResolverResult => {
  const webhookSecret = getApplicationVariableValue(
    DIRECTUS_WEBHOOK_SECRET_ENV_VAR_NAME,
  );

  if (!isNonEmptyString(webhookSecret)) {
    throw new Error(
      'DIRECTUS_WEBHOOK_SECRET server variable is not set. A server admin must set it on the Executive Search application registration before receiving Directus webhooks.',
    );
  }

  const { rawBody } = routePayload;

  if (isUndefined(rawBody)) {
    throw new Error(
      'Raw request body was not forwarded by the server; cannot verify the webhook signature',
    );
  }

  const signature = routePayload.headers['x-directus-signature'];
  const timestamp = routePayload.headers['x-directus-timestamp'];

  if (isUndefined(signature) || isUndefined(timestamp)) {
    throw new Error(
      'Missing x-directus-signature or x-directus-timestamp headers',
    );
  }

  const signatureCheck = verifyDirectusWebhookSignature({
    rawBody,
    signature,
    timestamp,
    secret: webhookSecret,
  });

  if (!signatureCheck.valid) {
    throw new Error(
      `Invalid Directus webhook signature: ${signatureCheck.error}`,
    );
  }

  const body = routePayload.body;

  if (isUndefined(body) || isNull(body)) {
    throw new Error('Directus webhook payload was empty');
  }

  const workspaceKey = body.workspace_key;

  if (!isNonEmptyString(workspaceKey)) {
    throw new Error(
      'Directus webhook payload is missing workspace_key',
    );
  }

  return {
    workspaceId: workspaceKey,
    targetLogicFunctionUniversalIdentifier:
      PROCESS_DIRECTUS_WEBHOOK_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
    payload: body,
    headers: routePayload.headers,
  };
};

export default defineLogicFunction({
  universalIdentifier:
    RECEIVE_DIRECTUS_WEBHOOK_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'receive-directus-webhook',
  description:
    'Verifies Directus webhook HMAC-SHA256 signatures and resolves the target workspace for inbound Directus sync events.',
  timeoutSeconds: 30,
  handler: receiveDirectusWebhookHandler,
  serverRouteTriggerSettings: {
    forwardedRequestHeaders: [
      'x-directus-signature',
      'x-directus-timestamp',
    ],
  },
});
