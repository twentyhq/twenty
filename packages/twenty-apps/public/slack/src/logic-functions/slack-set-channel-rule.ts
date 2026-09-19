import { defineLogicFunction } from 'twenty-sdk/define';

import { SLACK_CHANNEL_RULES_SET_ROUTE_PATH } from 'src/constants/slack-channel-rules-route-path.constant';
import { SLACK_SET_CHANNEL_RULE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { slackSetChannelRuleHandler } from 'src/logic-functions/handlers/slack-set-channel-rule-handler';

export default defineLogicFunction({
  universalIdentifier: SLACK_SET_CHANNEL_RULE_UNIVERSAL_IDENTIFIER,
  name: 'slack-set-channel-rule',
  description:
    'Creates or updates the rule for one Slack channel: open to anyone, linked members only, or silent. Confirms the channel with Slack first. Restricted to members with the roles permission.',
  timeoutSeconds: 30,
  httpRouteTriggerSettings: {
    path: SLACK_CHANNEL_RULES_SET_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
  handler: slackSetChannelRuleHandler,
});
