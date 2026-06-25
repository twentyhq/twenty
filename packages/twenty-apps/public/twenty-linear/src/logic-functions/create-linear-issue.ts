import { defineLogicFunction } from 'twenty-sdk/define';

import { CREATE_LINEAR_ISSUE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { createLinearIssueHandler } from 'src/logic-functions/handlers/create-linear-issue-handler';

export default defineLogicFunction({
  universalIdentifier: CREATE_LINEAR_ISSUE_UNIVERSAL_IDENTIFIER,
  name: 'create-linear-issue',
  description:
    'Create a Linear issue on behalf of the connected user. Requires a teamId (call list-linear-teams to discover one) and a title.',
  timeoutSeconds: 30,
  handler: createLinearIssueHandler,
  toolTriggerSettings: {
    inputSchema: {
      type: 'object',
      properties: {
        teamId: {
          type: 'string',
          description:
            'The Linear team ID to create the issue in. Use list-linear-teams to discover available teams.',
        },
        title: {
          type: 'string',
          description: 'The issue title.',
        },
        description: {
          type: 'string',
          description: 'Optional issue description (Markdown supported).',
        },
        priority: {
          type: 'integer',
          description:
            'Issue priority: 0 = No priority, 1 = Urgent, 2 = High, 3 = Medium, 4 = Low.',
          minimum: 0,
          maximum: 4,
        },
        stateId: {
          type: 'string',
          description:
            'The workflow state ID for the issue status. Use list-linear-issue-options to discover available states for a team.',
        },
        assigneeId: {
          type: 'string',
          description:
            'The user ID to assign the issue to. Use list-linear-issue-options to discover team members.',
        },
        projectId: {
          type: 'string',
          description: 'The project ID to associate the issue with.',
        },
        estimate: {
          type: 'number',
          description:
            'The estimate value for the issue. Must match the team estimate scale.',
        },
        labelIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of label IDs to apply to the issue.',
        },
        cycleId: {
          type: 'string',
          description: 'The cycle ID to add the issue to.',
        },
        dueDate: {
          type: 'string',
          description: 'Due date in YYYY-MM-DD format.',
        },
      },
      required: ['teamId', 'title'],
    },
  },
  workflowActionTriggerSettings: {
    label: 'Create Linear Issue',
    inputSchema: [
      {
        type: 'object',
        properties: {
          teamId: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          priority: { type: 'number' },
          stateId: { type: 'string' },
          assigneeId: { type: 'string' },
          projectId: { type: 'string' },
          estimate: { type: 'number' },
          labelIds: { type: 'array', items: { type: 'string' } },
          cycleId: { type: 'string' },
          dueDate: { type: 'string' },
        },
      },
    ],
    outputSchema: [
      {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          issue: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              identifier: { type: 'string' },
              title: { type: 'string' },
              url: { type: 'string' },
            },
          },
          error: { type: 'string' },
        },
      },
    ],
  },
});
