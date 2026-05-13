import { defineLogicFunction } from 'twenty-sdk/define';
import type { RoutePayload } from 'twenty-sdk/define';

import { LIST_LINEAR_TEAMS_ROUTE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { listLinearTeamsHandler } from 'src/logic-functions/handlers/list-linear-teams-handler';

const handler = async (_event: RoutePayload) => {
  return listLinearTeamsHandler();
};

export default defineLogicFunction({
  universalIdentifier: LIST_LINEAR_TEAMS_ROUTE_UNIVERSAL_IDENTIFIER,
  name: 'list-linear-teams-route',
  timeoutSeconds: 15,
  handler,
  httpRouteTriggerSettings: {
    path: '/linear/teams',
    httpMethod: 'GET',
    isAuthRequired: true,
  },
});
