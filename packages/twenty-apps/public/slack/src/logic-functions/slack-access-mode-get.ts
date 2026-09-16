import { defineLogicFunction } from 'twenty-sdk/define';

import { SLACK_ACCESS_MODE_GET_ROUTE_PATH } from 'src/constants/slack-access-mode-route-path.constant';
import { SLACK_ACCESS_MODE_GET_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { slackAccessModeGetHandler } from 'src/logic-functions/handlers/slack-access-mode-get-handler';

export default defineLogicFunction({
  universalIdentifier: SLACK_ACCESS_MODE_GET_UNIVERSAL_IDENTIFIER,
  name: 'slack-access-mode-get',
  description:
    'Return whether the Slack assistant is open to anyone or restricted to workspace members with a Slack user link.',
  timeoutSeconds: 15,
  httpRouteTriggerSettings: {
    path: SLACK_ACCESS_MODE_GET_ROUTE_PATH,
    httpMethod: 'GET',
    isAuthRequired: true,
  },
  handler: slackAccessModeGetHandler,
});
