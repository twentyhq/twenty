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
  toolTriggerSettings: {
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  workflowActionTriggerSettings: {
    label: 'List Linear Teams',
    inputSchema: [
      {
        type: 'object',
        properties: {},
      },
    ],
    outputSchema: [
      {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          teams: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                key: { type: 'string' },
              },
            },
          },
          error: { type: 'string' },
        },
      },
    ],
  },
});
