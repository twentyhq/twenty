import { defineLogicFunction } from 'twenty-sdk/define';

import { SLACK_USER_LINKS_REMOVE_ROUTE_PATH } from 'src/constants/slack-user-links-route-path.constant';
import { SLACK_REMOVE_USER_LINK_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { slackRemoveUserLinkHandler } from 'src/logic-functions/handlers/slack-remove-user-link-handler';

export default defineLogicFunction({
  universalIdentifier: SLACK_REMOVE_USER_LINK_UNIVERSAL_IDENTIFIER,
  name: 'slack-remove-user-link',
  description:
    'Removes a Slack user link so the assistant stops acting with that member permissions for the account. Restricted to members with the roles permission.',
  timeoutSeconds: 30,
  httpRouteTriggerSettings: {
    path: SLACK_USER_LINKS_REMOVE_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
  handler: slackRemoveUserLinkHandler,
});
