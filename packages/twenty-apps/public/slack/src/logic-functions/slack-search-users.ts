import { defineLogicFunction } from 'twenty-sdk/define';

import { SLACK_USER_LINKS_SEARCH_ROUTE_PATH } from 'src/constants/slack-user-links-route-path.constant';
import { SLACK_SEARCH_USERS_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { slackSearchUsersHandler } from 'src/logic-functions/handlers/slack-search-users-handler';

export default defineLogicFunction({
  universalIdentifier: SLACK_SEARCH_USERS_UNIVERSAL_IDENTIFIER,
  name: 'slack-search-users',
  description:
    'Searches the installed Slack workspace for users by name or email so an admin can pick the right account to link. Restricted to members with the roles permission.',
  timeoutSeconds: 30,
  httpRouteTriggerSettings: {
    path: SLACK_USER_LINKS_SEARCH_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
  handler: slackSearchUsersHandler,
});
