import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { PROCESS_RECALL_WEBHOOK_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { handleRecallWebhook } from 'src/logic-functions/flows/handle-recall-webhook.util';
import { buildRetryableStepFailure } from 'src/logic-functions/utils/build-step-failure.util';
import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { getApplicationVariableValue } from 'src/logic-functions/utils/get-application-variable-value.util';
import { verifyRecallWebhookSignature } from 'src/logic-functions/recall-api/verify-recall-webhook-signature.util';
import { extractTwentyWorkspaceIdFromRecallWebhook } from 'src/logic-functions/recall-api/extract-twenty-workspace-id-from-recall-webhook.util';
import { getCurrentWorkspaceId } from 'src/logic-functions/data/get-current-workspace-id.util';

export const processRecallWebhookHandler = async (payload: unknown) => {
  const envelope = asRecord(payload);
  const headers = asRecord(envelope?.headers);
  const secret = getApplicationVariableValue('RECALL_WEBHOOK_SECRET');
  if (!secret)
    throw new Error('Recall webhook verification is not configured.');
  if (
    typeof envelope?.rawBody !== 'string' ||
    !headers ||
    Object.values(headers).some(
      (value) => typeof value !== 'string' && value !== undefined,
    )
  ) {
    return { status: 'skipped', reason: 'unsigned webhook payload' };
  }
  const signature = verifyRecallWebhookSignature({
    rawBody: envelope.rawBody,
    headers: headers as Record<string, string | undefined>,
    secret,
    // The ingress checks freshness; durable queue retries may arrive much later.
    checkTimestamp: false,
  });
  if (!signature.valid)
    return { status: 'skipped', reason: 'invalid webhook signature' };
  const body = asRecord(JSON.parse(envelope.rawBody));
  const workspaceId = getCurrentWorkspaceId();
  if (
    !body ||
    !workspaceId ||
    extractTwentyWorkspaceIdFromRecallWebhook(body) !== workspaceId
  ) {
    return { status: 'skipped', reason: 'webhook workspace mismatch' };
  }
  try {
    return await handleRecallWebhook({
      client: new CoreApiClient(),
      body,
    });
  } catch (error) {
    throw buildRetryableStepFailure('Recall webhook processing', error);
  }
};

export default defineLogicFunction({
  universalIdentifier:
    PROCESS_RECALL_WEBHOOK_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'process-recall-webhook',
  description:
    'Updates the matching CallRecording lifecycle status from a verified Recall.ai webhook event.',
  timeoutSeconds: 30,
  handler: processRecallWebhookHandler,
});
