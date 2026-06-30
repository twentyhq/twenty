import { defineLogicFunction } from 'twenty-sdk/define';

import { CREATE_MULTICA_ISSUE_FUNCTION_ID } from 'src/constants/universal-identifiers';
import { createMulticaIssueHandler } from 'src/logic-functions/handlers/create-multica-issue-handler';

export default defineLogicFunction({
  universalIdentifier: CREATE_MULTICA_ISSUE_FUNCTION_ID,
  name: 'create-multica-issue',
  description:
    'Create a new ticket in the Multica Support project.',
  timeoutSeconds: 30,
  handler: createMulticaIssueHandler,
  toolTriggerSettings: {
    inputSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Ticket title.',
        },
        description: {
          type: 'string',
          description: 'Ticket description.',
        },
        priority: {
          type: 'string',
          enum: ['urgent', 'high', 'medium', 'low'],
          description: 'Ticket priority.',
        },
        status: {
          type: 'string',
          enum: ['backlog', 'todo', 'in_progress', 'in_review', 'done', 'cancelled'],
          description: 'Initial ticket status.',
        },
        dueDate: {
          type: 'string',
          description: 'Due date as ISO 8601 string (YYYY-MM-DD).',
        },
      },
      required: ['title'],
    },
  },
  workflowActionTriggerSettings: {
    label: 'Create Multica Ticket',
    inputSchema: [
      {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          priority: {
            type: 'string',
            enum: ['urgent', 'high', 'medium', 'low'],
          },
          status: {
            type: 'string',
            enum: ['backlog', 'todo', 'in_progress', 'in_review', 'done'],
          },
          dueDate: { type: 'string' },
        },
      },
    ],
    outputSchema: [
      {
        type: 'object',
        properties: {
          identifier: { type: 'string' },
          url: { type: 'string' },
        },
      },
    ],
  },
  httpRouteTriggerSettings: {
    path: '/multica/issues',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
