import { defineLogicFunction } from 'twenty-sdk/define';

import { SLACK_CHANNEL_RULES_REMOVE_ROUTE_PATH } from 'src/constants/slack-channel-rules-route-path.constant';
import { SLACK_REMOVE_CHANNEL_RULE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { slackRemoveChannelRuleHandler } from 'src/logic-functions/handlers/slack-remove-channel-rule-handler';

export default defineLogicFunction({
  universalIdentifier: SLACK_REMOVE_CHANNEL_RULE_UNIVERSAL_IDENTIFIER,
  name: 'slack-remove-channel-rule',
  description:
    'Removes a Slack channel rule so the channel follows the workspace access mode again. Restricted to members with the roles permission.',
  timeoutSeconds: 30,
  httpRouteTriggerSettings: {
    path: SLACK_CHANNEL_RULES_REMOVE_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
  handler: slackRemoveChannelRuleHandler,
});
