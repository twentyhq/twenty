import { defineLogicFunction } from 'twenty-sdk/define';

import { TEAMS_USER_LINKS_MATCH_ROUTE_PATH } from 'src/features/chat/constants/teams-user-links-route-path';
import { TEAMS_MATCH_USER_LINKS_UNIVERSAL_IDENTIFIER } from 'src/features/chat/constants/universal-identifiers';
import { teamsMatchUserLinksHandler } from 'src/features/chat/logic-functions/handlers/teams-match-user-links-handler';

export default defineLogicFunction({
  universalIdentifier: TEAMS_MATCH_USER_LINKS_UNIVERSAL_IDENTIFIER,
  name: 'teams-match-user-links',
  description:
    'Matches every user of the Microsoft organization directory against workspace members by email and stores the resulting links. Restricted to members with the roles permission.',
  timeoutSeconds: 120,
  httpRouteTriggerSettings: {
    path: TEAMS_USER_LINKS_MATCH_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
  handler: teamsMatchUserLinksHandler,
});
