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
