import { defineLogicFunction } from 'twenty-sdk/define';

import { TEAMS_USER_LINKS_SET_ROUTE_PATH } from 'src/features/chat/constants/teams-user-links-route-path';
import { TEAMS_SET_USER_LINK_UNIVERSAL_IDENTIFIER } from 'src/features/chat/constants/universal-identifiers';
import { teamsSetUserLinkHandler } from 'src/features/chat/logic-functions/handlers/teams-set-user-link-handler';
import { teamsSetUserLinkInputSchema } from 'src/features/chat/logic-functions/schemas/teams-set-user-link-input.schema';

export default defineLogicFunction({
  universalIdentifier: TEAMS_SET_USER_LINK_UNIVERSAL_IDENTIFIER,
  name: 'teams-set-user-link',
  description:
    'Link a Teams user from the Microsoft org directory to a workspace member so the assistant acts with that member permissions. Admin-set and authoritative immediately. Restricted to members with the roles permission.',
  timeoutSeconds: 30,
  toolTriggerSettings: {
    inputSchema: teamsSetUserLinkInputSchema,
  },
  httpRouteTriggerSettings: {
    path: TEAMS_USER_LINKS_SET_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
  handler: teamsSetUserLinkHandler,
});
