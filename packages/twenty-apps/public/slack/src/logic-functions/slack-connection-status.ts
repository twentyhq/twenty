import { defineLogicFunction } from 'twenty-sdk/define';

import { SLACK_USER_LINKS_CONNECTION_STATUS_ROUTE_PATH } from 'src/constants/slack-user-links-route-path.constant';
import { SLACK_CONNECTION_STATUS_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { slackConnectionStatusHandler } from 'src/logic-functions/handlers/slack-connection-status-handler';

export default defineLogicFunction({
  universalIdentifier: SLACK_CONNECTION_STATUS_UNIVERSAL_IDENTIFIER,
  name: 'slack-connection-status',
  description:
    'Tells the settings tab whether a Slack workspace connection exists, so it can hide the link management tools until Slack is connected.',
  timeoutSeconds: 30,
  httpRouteTriggerSettings: {
    path: SLACK_USER_LINKS_CONNECTION_STATUS_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
  handler: slackConnectionStatusHandler,
});
