import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import {
  Response,
  type LogicFunctionExecutionContext,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { GRANOLA_PERSONAL_CONNECTIONS_ROUTE_PATH } from 'src/constants/granola-personal-connection.constant';
import { GRANOLA_PERSONAL_CONNECTIONS_ROUTE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { listGranolaPersonalConnections } from 'src/logic-functions/utils/list-granola-personal-connections.util';

export const granolaPersonalConnectionsHandler = async (
  _payload: RoutePayload<unknown>,
  { userWorkspaceId }: Pick<LogicFunctionExecutionContext, 'userWorkspaceId'>,
) => {
  if (!isDefined(userWorkspaceId)) {
    return new Response({ error: 'AUTHENTICATION_REQUIRED' }, { status: 401 });
  }

  const connections = await listGranolaPersonalConnections(userWorkspaceId);

  return {
    success: true,
    connections: connections.map(({ id, name }) => ({ id, name })),
  };
};

export default defineLogicFunction({
  universalIdentifier: GRANOLA_PERSONAL_CONNECTIONS_ROUTE_UNIVERSAL_IDENTIFIER,
  name: 'granola-personal-connections',
  description: 'Lists the requesting member’s Granola connections.',
  timeoutSeconds: 30,
  handler: granolaPersonalConnectionsHandler,
  httpRouteTriggerSettings: {
    path: GRANOLA_PERSONAL_CONNECTIONS_ROUTE_PATH,
    httpMethod: 'GET',
    isAuthRequired: true,
  },
});
