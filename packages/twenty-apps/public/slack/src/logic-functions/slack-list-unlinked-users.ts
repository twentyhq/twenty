import { defineLogicFunction } from 'twenty-sdk/define';

import { SLACK_USER_LINKS_UNLINKED_ROUTE_PATH } from 'src/constants/slack-user-links-route-path.constant';
import { SLACK_LIST_UNLINKED_USERS_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { slackListUnlinkedUsersHandler } from 'src/logic-functions/handlers/slack-list-unlinked-users-handler';

export default defineLogicFunction({
  universalIdentifier: SLACK_LIST_UNLINKED_USERS_UNIVERSAL_IDENTIFIER,
  name: 'slack-list-unlinked-users',
  description:
    'Lists Slack workspace users that have no Slack user link yet so an admin can link them manually. Restricted to members with the roles permission.',
  timeoutSeconds: 60,
  httpRouteTriggerSettings: {
    path: SLACK_USER_LINKS_UNLINKED_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
  handler: slackListUnlinkedUsersHandler,
});
