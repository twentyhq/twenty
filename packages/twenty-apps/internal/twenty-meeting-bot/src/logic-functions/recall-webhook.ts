import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { Response } from 'twenty-sdk/logic-function';

import { RECALL_WEBHOOK_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/recall-webhook-logic-function-universal-identifier';
import { RECALL_WEBHOOK_SECRET_ENV_VAR_NAME } from 'src/logic-functions/constants/recall-webhook-secret-env-var-name';
import { getApplicationVariableValue } from 'src/logic-functions/utils/get-application-variable-value.util';
import { handleRecallWebhook } from 'src/logic-functions/utils/handle-recall-webhook.util';
import { verifyRecallWebhookSignature } from 'src/logic-functions/utils/verify-recall-webhook-signature.util';

type RecallWebhookPayload = {
  event?: unknown;
  type?: unknown;
  data?: unknown;
  bot?: unknown;
};

// Non-2xx responses make Svix retry the delivery; a returned plain object
// would be sent as HTTP 200 and permanently mark the event as delivered.
const rejectWebhook = (status: number, error: string): Response => {
  console.error(`[recall-recording-bot] webhook rejected: ${error}`);

  return new Response({ error }, { status });
};

export const recallWebhookRouteHandler = async (
  routePayload: RoutePayload<RecallWebhookPayload>,
): Promise<object> => {
  const webhookSecret = getApplicationVariableValue(
    RECALL_WEBHOOK_SECRET_ENV_VAR_NAME,
  );

  if (webhookSecret === undefined || webhookSecret.trim() === '') {
    return rejectWebhook(
      500,
      'RECALL_WEBHOOK_SECRET server variable is not set. A server admin must copy it from the Recall webhook endpoint settings and set it on the Twenty Meeting Bot application registration.',
    );
  }

  const { rawBody } = routePayload;

  if (rawBody === undefined) {
    return rejectWebhook(
      500,
      'Raw request body was not forwarded by the server; cannot verify the webhook signature',
    );
  }

  const signatureCheck = verifyRecallWebhookSignature({
    rawBody,
    headers: routePayload.headers,
    secret: webhookSecret,
  });

  if (!signatureCheck.valid) {
    return rejectWebhook(
      401,
      `Invalid webhook signature: ${signatureCheck.error}`,
    );
  }

  if (routePayload.body === undefined || routePayload.body === null) {
    return rejectWebhook(400, 'Webhook payload was empty');
  }

  return handleRecallWebhook({
    client: new CoreApiClient(),
    body: routePayload.body,
  });
};

export default defineLogicFunction({
  universalIdentifier: RECALL_WEBHOOK_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'recall-recording-bot-webhook',
  description:
    'Receives Recall.ai webhook events and updates matching CallRecording records.',
  timeoutSeconds: 60,
  handler: recallWebhookRouteHandler,
  httpRouteTriggerSettings: {
    path: '/webhook/recall',
    httpMethod: 'POST',
    isAuthRequired: false,
    forwardedRequestHeaders: [
      'webhook-id',
      'webhook-timestamp',
      'webhook-signature',
      'svix-id',
      'svix-timestamp',
      'svix-signature',
    ],
  },
});
