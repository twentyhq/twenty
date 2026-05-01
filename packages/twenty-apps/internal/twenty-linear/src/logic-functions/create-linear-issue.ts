import { defineLogicFunction } from 'twenty-sdk/define';

import { CREATE_LINEAR_ISSUE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { createLinearIssueHandler } from 'src/logic-functions/handlers/create-linear-issue-handler';

export default defineLogicFunction({
  universalIdentifier: CREATE_LINEAR_ISSUE_UNIVERSAL_IDENTIFIER,
  name: 'create-linear-issue',
  description:
    'Creates a Linear issue on behalf of the connected user. POST a JSON body with `teamId` and `title` (and optional `description`).',
  timeoutSeconds: 30,
  handler: createLinearIssueHandler,
  httpRouteTriggerSettings: {
    path: '/linear/create-issue',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
