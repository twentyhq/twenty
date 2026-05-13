import { defineLogicFunction } from 'twenty-sdk/define';
import type { RoutePayload } from 'twenty-sdk/define';

import { LIST_LINEAR_ISSUE_OPTIONS_ROUTE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { listLinearIssueOptionsHandler } from 'src/logic-functions/handlers/list-linear-issue-options-handler';

const handler = async (event: RoutePayload) => {
  return listLinearIssueOptionsHandler({
    teamId: event.queryStringParameters?.teamId,
  });
};

export default defineLogicFunction({
  universalIdentifier: LIST_LINEAR_ISSUE_OPTIONS_ROUTE_UNIVERSAL_IDENTIFIER,
  name: 'list-linear-issue-options-route',
  timeoutSeconds: 15,
  handler,
  httpRouteTriggerSettings: {
    path: '/linear/issue-options',
    httpMethod: 'GET',
    isAuthRequired: true,
  },
});
