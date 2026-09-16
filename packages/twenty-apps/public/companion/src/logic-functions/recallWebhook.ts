import { defineLogicFunction } from 'twenty-sdk/define';
import { RECALL_WEBHOOK_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/RECALL_WEBHOOK_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER';
import { recallWebhookRouteHandler } from 'src/logic-functions/utils/recallWebhookRouteHandler';

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
