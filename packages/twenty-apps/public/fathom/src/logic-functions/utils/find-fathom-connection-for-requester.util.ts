import {
  type AppConnection,
  findConnectionForRequest,
  type LogicFunctionExecutionContext,
} from 'twenty-sdk/logic-function';

import { listFathomConnections } from 'src/logic-functions/utils/list-fathom-connections.util';

export const findFathomConnectionForRequester = async (
  context: Pick<LogicFunctionExecutionContext, 'userWorkspaceId'>,
): Promise<AppConnection | null> =>
  findConnectionForRequest(await listFathomConnections(), context);
