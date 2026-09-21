import { defineLogicFunction } from 'twenty-sdk/define';

import { SLACK_USER_LINKS_CONNECTION_STATUS_ROUTE_PATH } from 'src/constants/slack-user-links-route-path.constant';
import { SLACK_CONNECTION_STATUS_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { slackConnectionStatusHandler } from 'src/logic-functions/handlers/slack-connection-status-handler';

export default defineLogicFunction({
  universalIdentifier: SLACK_CONNECTION_STATUS_UNIVERSAL_IDENTIFIER,
  name: 'slack-connection-status',
  description:
    'Tells the settings tab whether a Slack workspace connection exists and whether it is healthy: the stored token still passes auth.test, and the installed Slack team is claimed by this Twenty workspace so events route here. The tab hides the link management tools until Slack is connected and shows a repair callout when the connection is broken.',
  timeoutSeconds: 30,
  httpRouteTriggerSettings: {
    path: SLACK_USER_LINKS_CONNECTION_STATUS_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
  handler: slackConnectionStatusHandler,
});
