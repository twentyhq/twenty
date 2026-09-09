import { defineLogicFunction } from 'twenty-sdk/define';

import { SLACK_DELIVER_MESSAGE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { slackDeliverMessageHandler } from 'src/logic-functions/handlers/slack-deliver-message-handler';
import { SLACK_MESSAGE_DELIVERY_TIMEOUT_SECONDS } from 'src/logic-functions/constants/slack-message-delivery-timeout-seconds';

export default defineLogicFunction({
  universalIdentifier: SLACK_DELIVER_MESSAGE_UNIVERSAL_IDENTIFIER,
  name: 'slack-deliver-message',
  description:
    'Posts a single Slack message that was rate limited on its first attempt. Enqueued with the delay Slack asked for, so the calling function never waits on a 429.',
  timeoutSeconds: SLACK_MESSAGE_DELIVERY_TIMEOUT_SECONDS,
  handler: slackDeliverMessageHandler,
});
