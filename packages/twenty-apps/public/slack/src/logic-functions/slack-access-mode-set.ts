import { defineLogicFunction } from 'twenty-sdk/define';

import { SLACK_ACCESS_MODE_SET_ROUTE_PATH } from 'src/constants/slack-access-mode-route-path.constant';
import { SLACK_ACCESS_MODE_SET_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { slackAccessModeSetHandler } from 'src/logic-functions/handlers/slack-access-mode-set-handler';

export default defineLogicFunction({
  universalIdentifier: SLACK_ACCESS_MODE_SET_UNIVERSAL_IDENTIFIER,
  name: 'slack-access-mode-set',
  description:
    'Set whether the Slack assistant is open to anyone or restricted to workspace members with a Slack user link. Restricted to members with the workspace members permission.',
  timeoutSeconds: 15,
  httpRouteTriggerSettings: {
    path: SLACK_ACCESS_MODE_SET_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
  handler: slackAccessModeSetHandler,
});
