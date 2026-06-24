import { isNull, isUndefined } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { Response } from 'twenty-sdk/logic-function';

import { RECALL_WEBHOOK_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/recall-webhook-logic-function-universal-identifier';
import { RECALL_WEBHOOK_SECRET_ENV_VAR_NAME } from 'src/logic-functions/constants/recall-webhook-secret-env-var-name';
import { handleRecallWebhook } from 'src/logic-functions/flows/handle-recall-webhook.util';
import { type RecallWebhookBody } from 'src/logic-functions/recall-api/parse-recall-webhook-event.util';
import { verifyRecallWebhookSignature } from 'src/logic-functions/recall-api/verify-recall-webhook-signature.util';
import { getApplicationVariableValue } from 'src/logic-functions/utils/get-application-variable-value.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

// Non-2xx makes Svix retry; a returned plain object would 200-ack permanently.
const rejectWebhook = (status: number, error: string): Response => {
  console.error(`[twenty-meeting-bot] webhook rejected: ${error}`);

  return new Response({ error }, { status });
};

export const recallWebhookRouteHandler = async (
  routePayload: RoutePayload<RecallWebhookBody>,
): Promise<object> => {
  const webhookSecret = getApplicationVariableValue(
    RECALL_WEBHOOK_SECRET_ENV_VAR_NAME,
  );

  if (!isNonEmptyString(webhookSecret)) {
    return rejectWebhook(
      500,
      'RECALL_WEBHOOK_SECRET server variable is not set. A server admin must copy it from the Recall webhook endpoint settings and set it on the Twenty Meeting Bot application registration.',
    );
  }

  const { rawBody } = routePayload;

  if (isUndefined(rawBody)) {
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

  if (isUndefined(routePayload.body) || isNull(routePayload.body)) {
    return rejectWebhook(400, 'Webhook payload was empty');
  }

  return handleRecallWebhook({
    client: new CoreApiClient(),
    body: routePayload.body,
  });
};

export default defineLogicFunction({
  universalIdentifier: RECALL_WEBHOOK_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'recall-webhook',
  description:
    'Receives Recall.ai webhook events and updates the matching CallRecording lifecycle status.',
  timeoutSeconds: 30,
  handler: recallWebhookRouteHandler,
  serverWebhookTriggerSettings: {
    workspaceIdResolver: {
      source: 'body',
      path: 'data.bot.metadata.twentyWorkspaceId',
    },
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
