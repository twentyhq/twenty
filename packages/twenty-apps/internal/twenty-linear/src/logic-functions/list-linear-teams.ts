import { defineLogicFunction } from 'twenty-sdk/define';

import { LIST_LINEAR_TEAMS_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { listLinearTeamsHandler } from 'src/logic-functions/handlers/list-linear-teams-handler';

export default defineLogicFunction({
  universalIdentifier: LIST_LINEAR_TEAMS_UNIVERSAL_IDENTIFIER,
  name: 'list-linear-teams',
  description:
    "Returns the connected user's Linear teams. Useful for picking a teamId to pass to create-linear-issue.",
  timeoutSeconds: 15,
  handler: listLinearTeamsHandler,
  isTool: true,
  toolInputSchema: {
    type: 'object',
    properties: {},
  },
});
