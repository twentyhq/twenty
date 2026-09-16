import { isNull, isUndefined } from '@sniptt/guards';
import { type RoutePayload } from 'twenty-sdk/define';
import { PROCESS_RECALL_WEBHOOK_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/PROCESS_RECALL_WEBHOOK_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER';
import { RECALL_WEBHOOK_SECRET_ENV_VAR_NAME } from 'src/logic-functions/constants/RECALL_WEBHOOK_SECRET_ENV_VAR_NAME';
import { extractTwentyWorkspaceIdFromRecallWebhook } from 'src/logic-functions/recall-api/utils/extractTwentyWorkspaceIdFromRecallWebhook';
import { type RecallWebhookBody } from 'src/logic-functions/types/RecallWebhookBody';
import { verifyRecallWebhookSignature } from 'src/logic-functions/recall-api/utils/verifyRecallWebhookSignature';
import { getApplicationVariableValue } from 'src/logic-functions/utils/getApplicationVariableValue';
import { isNonEmptyString } from 'src/logic-functions/utils/isNonEmptyString';
import { asRecord } from 'src/logic-functions/utils/asRecord';

type RecallWebhookResolverResult = {
  workspaceId: string;
  targetLogicFunctionUniversalIdentifier: string;
  payload: { rawBody: string; headers: Record<string, string | undefined> };
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
      'RECALL_WEBHOOK_SECRET server variable is not set. A server admin must copy it from the Recall webhook endpoint settings and set it on the Desktop Recorder application registration.',
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

  // Direct function execution can supply a parsed body different from the signed bytes.
  const body = asRecord(JSON.parse(rawBody));

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
    payload: { rawBody, headers: routePayload.headers },
  };
};
