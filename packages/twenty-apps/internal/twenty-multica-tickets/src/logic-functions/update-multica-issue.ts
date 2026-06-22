import { defineLogicFunction } from 'twenty-sdk/define';

import { UPDATE_MULTICA_ISSUE_FUNCTION_ID } from 'src/constants/universal-identifiers';
import { updateMulticaIssueHandler } from 'src/logic-functions/handlers/update-multica-issue-handler';

export default defineLogicFunction({
  universalIdentifier: UPDATE_MULTICA_ISSUE_FUNCTION_ID,
  name: 'update-multica-issue',
  description:
    'Update an existing Multica ticket status, priority, or details.',
  timeoutSeconds: 30,
  handler: updateMulticaIssueHandler,
  databaseEventTriggerSettings: {
    eventName: 'xopureTicket.updated',
    updatedFields: ['status', 'priority', 'title', 'description'],
  },
  toolTriggerSettings: {
    inputSchema: {
      type: 'object',
      properties: {
        multicaIssueId: {
          type: 'string',
          description: 'Multica issue UUID.',
        },
        status: {
          type: 'string',
          enum: [
            'backlog',
            'todo',
            'in_progress',
            'in_review',
            'done',
            'cancelled',
          ],
        },
        priority: {
          type: 'string',
          enum: ['urgent', 'high', 'medium', 'low'],
        },
      },
      required: ['multicaIssueId'],
    },
  },
});
