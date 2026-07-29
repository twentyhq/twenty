import { defineLogicFunction } from 'twenty-sdk/define';

import { SLACK_EVENTS_ENQUEUE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { enqueueSlackAssistantRequest } from 'src/logic-functions/utils/enqueue-slack-assistant-request';

export default defineLogicFunction({
  universalIdentifier: SLACK_EVENTS_ENQUEUE_UNIVERSAL_IDENTIFIER,
  name: 'slack-events-enqueue',
  description:
    'Runs in the resolved workspace: enqueues a Slack Assistant Request record for the assistant worker.',
  timeoutSeconds: 15,
  handler: enqueueSlackAssistantRequest,
});
