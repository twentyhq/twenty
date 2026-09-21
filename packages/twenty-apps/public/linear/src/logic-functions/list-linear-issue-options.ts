import { defineLogicFunction } from 'twenty-sdk/define';

import { LIST_LINEAR_ISSUE_OPTIONS_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { listLinearIssueOptionsHandler } from 'src/logic-functions/handlers/list-linear-issue-options-handler';

export default defineLogicFunction({
  universalIdentifier: LIST_LINEAR_ISSUE_OPTIONS_UNIVERSAL_IDENTIFIER,
  name: 'list-linear-issue-options',
  description:
    'Returns available options for creating a Linear issue in a specific team: workflow states, members, projects, labels, cycles, and estimation settings. Requires a teamId (call list-linear-teams to discover one).',
  timeoutSeconds: 15,
  handler: listLinearIssueOptionsHandler,
  toolTriggerSettings: {
    inputSchema: {
      type: 'object',
      properties: {
        teamId: {
          type: 'string',
          description:
            'The Linear team ID to fetch issue options for. Use list-linear-teams to discover available teams.',
        },
      },
      required: ['teamId'],
    },
  },
  workflowActionTriggerSettings: {
    label: 'List Linear Issue Options',
    inputSchema: [
      {
        type: 'object',
        properties: {
          teamId: { type: 'string' },
        },
      },
    ],
    outputSchema: [
      {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          options: {
            type: 'object',
            properties: {
              states: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    type: { type: 'string' },
                    position: { type: 'number' },
                  },
                },
              },
              members: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    displayName: { type: 'string' },
                  },
                },
              },
              projects: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                  },
                },
              },
              labels: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    color: { type: 'string' },
                  },
                },
              },
              cycles: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    number: { type: 'number' },
                    startsAt: { type: 'string' },
                    endsAt: { type: 'string' },
                  },
                },
              },
              estimationType: { type: 'string' },
              estimationAllowZero: { type: 'boolean' },
            },
          },
          error: { type: 'string' },
        },
      },
    ],
  },
});
