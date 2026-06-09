import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';

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

const recallWebhookRouteHandler = async (
  routePayload: RoutePayload<RecallWebhookPayload>,
): Promise<object> => {
  const webhookSecret = await getApplicationVariableValue(
    RECALL_WEBHOOK_SECRET_ENV_VAR_NAME,
  );

  if (webhookSecret === undefined || webhookSecret.trim() === '') {
    return {
      error:
        'RECALL_WEBHOOK_SECRET application variable is not set. Copy it from the Recall webhook endpoint settings.',
    };
  }

  const { rawBody } = routePayload;

  if (rawBody === undefined) {
    return {
      error:
        'Invalid webhook signature: raw request body was not forwarded by the server',
    };
  }

  const signatureCheck = verifyRecallWebhookSignature({
    rawBody,
    headers: routePayload.headers,
    secret: webhookSecret,
  });

  if (!signatureCheck.valid) {
    return {
      error: `Invalid webhook signature: ${signatureCheck.error}`,
    };
  }

  if (routePayload.body === undefined || routePayload.body === null) {
    return {
      error: 'Webhook payload was empty',
    };
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
