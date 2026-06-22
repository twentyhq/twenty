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
        key: 'title',
        label: 'Title',
        type: 'text',
        required: true,
      },
      {
        key: 'description',
        label: 'Description',
        type: 'text',
      },
      {
        key: 'priority',
        label: 'Priority',
        type: 'select',
        options: [
          { value: 'urgent', label: 'Urgent' },
          { value: 'high', label: 'High' },
          { value: 'medium', label: 'Medium' },
          { value: 'low', label: 'Low' },
        ],
      },
      {
        key: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { value: 'backlog', label: 'Backlog' },
          { value: 'todo', label: 'Todo' },
          { value: 'in_progress', label: 'In Progress' },
          { value: 'in_review', label: 'In Review' },
          { value: 'done', label: 'Done' },
        ],
      },
      {
        key: 'dueDate',
        label: 'Due date',
        type: 'date',
      },
    ],
    outputSchema: [
      {
        key: 'identifier',
        label: 'Issue ID',
        type: 'text',
      },
      {
        key: 'url',
        label: 'URL',
        type: 'text',
      },
    ],
  },
  httpRouteTriggerSettings: {
    path: '/multica/issues',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
