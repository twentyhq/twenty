import { isNull, isUndefined } from '@sniptt/guards';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';

import { PROCESS_RECALL_WEBHOOK_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/process-recall-webhook-logic-function-universal-identifier';
import { RECALL_WEBHOOK_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/recall-webhook-logic-function-universal-identifier';
import { RECALL_WEBHOOK_SECRET_ENV_VAR_NAME } from 'src/logic-functions/constants/recall-webhook-secret-env-var-name';
import { extractTwentyWorkspaceIdFromRecallWebhook } from 'src/logic-functions/recall-api/extract-twenty-workspace-id-from-recall-webhook.util';
import { type RecallWebhookBody } from 'src/logic-functions/recall-api/parse-recall-webhook-event.util';
import { verifyRecallWebhookSignature } from 'src/logic-functions/recall-api/verify-recall-webhook-signature.util';
import { getApplicationVariableValue } from 'src/logic-functions/utils/get-application-variable-value.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

type RecallWebhookResolverResult = {
  workspaceId: string;
  targetLogicFunctionUniversalIdentifier: string;
  payload: RecallWebhookBody;
};

// A thrown error becomes a non-2xx, which makes Svix retry; a returned result dispatches to the target.
export const recallWebhookRouteHandler = (
  routePayload: RoutePayload<RecallWebhookBody>,
): RecallWebhookResolverResult => {
  const webhookSecret = getApplicationVariableValue(
    RECALL_WEBHOOK_SECRET_ENV_VAR_NAME,
  );

  if (!isNonEmptyString(webhookSecret)) {
    throw new Error(
      'RECALL_WEBHOOK_SECRET server variable is not set. A server admin must copy it from the Recall webhook endpoint settings and set it on the Call Recorder application registration.',
    );
  }

  const { rawBody } = routePayload;

  if (isUndefined(rawBody)) {
    throw new Error(
      'Raw request body was not forwarded by the server; cannot verify the webhook signature',
    );
  }

  const signatureCheck = verifyRecallWebhookSignature({
    rawBody,
    headers: routePayload.headers,
    secret: webhookSecret,
  });

  if (!signatureCheck.valid) {
    throw new Error(`Invalid webhook signature: ${signatureCheck.error}`);
  }

  const body = routePayload.body;

  if (isUndefined(body) || isNull(body)) {
    throw new Error('Webhook payload was empty');
  }

  const workspaceId = extractTwentyWorkspaceIdFromRecallWebhook(body);

  if (!isNonEmptyString(workspaceId)) {
    throw new Error(
      'Webhook payload is missing the Twenty workspace id in the Recall bot metadata',
    );
  }

  return {
    workspaceId,
    targetLogicFunctionUniversalIdentifier:
      PROCESS_RECALL_WEBHOOK_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
    payload: body,
  };
};

export default defineLogicFunction({
  universalIdentifier: RECALL_WEBHOOK_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'recall-webhook',
  description:
    'Verifies Recall.ai webhook signatures and resolves the target workspace for the matching CallRecording update.',
  timeoutSeconds: 30,
  handler: recallWebhookRouteHandler,
  serverRouteTriggerSettings: {
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
