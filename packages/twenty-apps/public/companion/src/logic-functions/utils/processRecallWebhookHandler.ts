import { CoreApiClient } from 'twenty-client-sdk/core';
import { handleRecallWebhook } from 'src/logic-functions/flows/utils/handleRecallWebhook';
import { buildStepError } from 'src/logic-functions/utils/buildStepError';
import { asRecord } from 'src/logic-functions/utils/asRecord';
import { getApplicationVariableValue } from 'src/logic-functions/utils/getApplicationVariableValue';
import { verifyRecallWebhookSignature } from 'src/logic-functions/recall-api/utils/verifyRecallWebhookSignature';
import { extractTwentyWorkspaceIdFromRecallWebhook } from 'src/logic-functions/recall-api/utils/extractTwentyWorkspaceIdFromRecallWebhook';
import { getCurrentWorkspaceId } from 'src/logic-functions/data/utils/getCurrentWorkspaceId';

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
    // Expired deliveries are recovered by the recording reconciler.
    checkTimestamp: true,
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
    throw buildStepError('Recall webhook processing', error);
  }
};
