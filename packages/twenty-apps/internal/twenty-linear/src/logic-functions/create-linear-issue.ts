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
  isTool: true,
  toolInputSchema: {
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
});
