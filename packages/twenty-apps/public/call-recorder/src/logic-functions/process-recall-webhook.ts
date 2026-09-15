import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { PROCESS_RECALL_WEBHOOK_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { handleRecallWebhook } from 'src/logic-functions/flows/handle-recall-webhook.util';
import { type RecallWebhookBody } from 'src/logic-functions/recall-api/parse-recall-webhook-event.util';
import { buildRetryableStepFailure } from 'src/logic-functions/utils/build-step-failure.util';

export const processRecallWebhookHandler = async (body: RecallWebhookBody) => {
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
