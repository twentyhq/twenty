import { defineLogicFunction } from 'twenty-sdk/define';
import type { RoutePayload } from 'twenty-sdk/define';

import { LIST_LINEAR_WORKFLOW_STATES_ROUTE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { listLinearWorkflowStatesHandler } from 'src/logic-functions/handlers/list-linear-workflow-states-handler';

const handler = async (event: RoutePayload) => {
  return listLinearWorkflowStatesHandler({
    teamId: event.queryStringParameters?.teamId,
  });
};

export default defineLogicFunction({
  universalIdentifier: LIST_LINEAR_WORKFLOW_STATES_ROUTE_UNIVERSAL_IDENTIFIER,
  name: 'list-linear-workflow-states-route',
  timeoutSeconds: 15,
  handler,
  httpRouteTriggerSettings: {
    path: '/linear/workflow-states',
    httpMethod: 'GET',
    isAuthRequired: true,
  },
});
