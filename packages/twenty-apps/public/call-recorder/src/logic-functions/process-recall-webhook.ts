import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { PROCESS_RECALL_WEBHOOK_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/process-recall-webhook-logic-function-universal-identifier';
import { handleRecallWebhook } from 'src/logic-functions/flows/handle-recall-webhook.util';
import { type RecallWebhookBody } from 'src/logic-functions/recall-api/parse-recall-webhook-event.util';

// Dispatched by the recall-webhook resolver; runs in the resolved workspace so the client is workspace-scoped.
export const processRecallWebhookHandler = (
  body: RecallWebhookBody,
): Promise<object> =>
  handleRecallWebhook({
    client: new CoreApiClient(),
    body,
  });

export default defineLogicFunction({
  universalIdentifier:
    PROCESS_RECALL_WEBHOOK_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'process-recall-webhook',
  description:
    'Updates the matching CallRecording lifecycle status from a verified Recall.ai webhook event.',
  timeoutSeconds: 30,
  handler: processRecallWebhookHandler,
});
