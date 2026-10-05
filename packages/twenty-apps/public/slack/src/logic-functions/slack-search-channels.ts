import { defineLogicFunction } from 'twenty-sdk/define';

import { SLACK_CHANNEL_RULES_SEARCH_ROUTE_PATH } from 'src/constants/slack-channel-rules-route-path.constant';
import { SLACK_SEARCH_CHANNELS_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { slackSearchChannelsHandler } from 'src/logic-functions/handlers/slack-search-channels-handler';

export default defineLogicFunction({
  universalIdentifier: SLACK_SEARCH_CHANNELS_UNIVERSAL_IDENTIFIER,
  name: 'slack-search-channels',
  description:
    'Searches the Slack channels visible to the bot by name so an admin can pick one for a channel rule. Restricted to members with the roles permission.',
  timeoutSeconds: 30,
  httpRouteTriggerSettings: {
    path: SLACK_CHANNEL_RULES_SEARCH_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
  handler: slackSearchChannelsHandler,
});
