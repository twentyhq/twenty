import { defineLogicFunction } from 'twenty-sdk/define';

import { TEAMS_USER_LINKS_UNLINKED_ROUTE_PATH } from 'src/features/chat/constants/teams-user-links-route-path';
import { TEAMS_LIST_UNLINKED_USERS_UNIVERSAL_IDENTIFIER } from 'src/features/chat/constants/universal-identifiers';
import { teamsListUnlinkedUsersHandler } from 'src/features/chat/logic-functions/handlers/teams-list-unlinked-users-handler';

export default defineLogicFunction({
  universalIdentifier: TEAMS_LIST_UNLINKED_USERS_UNIVERSAL_IDENTIFIER,
  name: 'teams-list-unlinked-users',
  description:
    'Lists Microsoft org directory users that have no Teams user link yet so an admin can link them manually. Restricted to members with the roles permission.',
  timeoutSeconds: 60,
  httpRouteTriggerSettings: {
    path: TEAMS_USER_LINKS_UNLINKED_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
  handler: teamsListUnlinkedUsersHandler,
});
