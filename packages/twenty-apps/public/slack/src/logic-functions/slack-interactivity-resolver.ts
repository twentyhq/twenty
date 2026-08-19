import { defineLogicFunction } from 'twenty-sdk/define';

import { SLACK_INTERACTIVITY_ROUTE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { slackInteractivityResolverHandler } from 'src/logic-functions/handlers/slack-interactivity-resolver-handler';

export default defineLogicFunction({
  universalIdentifier: SLACK_INTERACTIVITY_ROUTE_UNIVERSAL_IDENTIFIER,
  name: 'slack-interactivity-resolver',
  description:
    'Receives Slack interactivity callbacks (block_actions), verifies the request signature in the owner workspace, acknowledges interactions it does not handle, and resolves the target workspace plus the function that stores the assistant answer feedback.',
  timeoutSeconds: 15,
  handler: slackInteractivityResolverHandler,
  serverRouteTriggerSettings: {
    forwardedRequestHeaders: ['x-slack-signature', 'x-slack-request-timestamp'],
  },
});
