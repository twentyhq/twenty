import { defineLogicFunction } from 'twenty-sdk/define';

import { TEAMS_USER_LINKS_SEARCH_ROUTE_PATH } from 'src/features/chat/constants/teams-user-links-route-path';
import { TEAMS_SEARCH_USERS_UNIVERSAL_IDENTIFIER } from 'src/features/chat/constants/universal-identifiers';
import { teamsSearchUsersHandler } from 'src/features/chat/logic-functions/handlers/teams-search-users-handler';

export default defineLogicFunction({
  universalIdentifier: TEAMS_SEARCH_USERS_UNIVERSAL_IDENTIFIER,
  name: 'teams-search-users',
  description:
    'Searches the Microsoft org directory by name or email so an admin can pick the right account to link. Restricted to members with the roles permission.',
  timeoutSeconds: 30,
  httpRouteTriggerSettings: {
    path: TEAMS_USER_LINKS_SEARCH_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
  handler: teamsSearchUsersHandler,
});
