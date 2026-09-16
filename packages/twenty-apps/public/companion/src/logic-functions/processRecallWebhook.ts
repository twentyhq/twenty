import { defineLogicFunction } from 'twenty-sdk/define';
import { PROCESS_RECALL_WEBHOOK_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/PROCESS_RECALL_WEBHOOK_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER';
import { processRecallWebhookHandler } from 'src/logic-functions/utils/processRecallWebhookHandler';

export default defineLogicFunction({
  universalIdentifier:
    PROCESS_RECALL_WEBHOOK_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'process-recall-webhook',
  description:
    'Updates the matching CallRecording lifecycle status from a verified Recall.ai webhook event.',
  timeoutSeconds: 30,
  handler: processRecallWebhookHandler,
});
