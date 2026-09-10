import {
  type AppConnection,
  findConnectionForRequest,
  type LogicFunctionExecutionContext,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'src/utils/is-defined';

import { listFathomConnections } from 'src/logic-functions/utils/list-fathom-connections.util';

// A person acts through their own Fathom account. A run with nobody behind it
// (database-event or cron workflow) sees the union of the connected accounts,
// which is what the webhooks already sync into the shared CallRecording object.
export const listFathomConnectionsForRequest = async (
  context: Pick<LogicFunctionExecutionContext, 'userWorkspaceId'>,
): Promise<AppConnection[]> => {
  const connections = await listFathomConnections();

  if (!isDefined(context.userWorkspaceId)) {
    return connections;
  }

  const requesterConnection = findConnectionForRequest(connections, context);

  return isDefined(requesterConnection) ? [requesterConnection] : [];
};
