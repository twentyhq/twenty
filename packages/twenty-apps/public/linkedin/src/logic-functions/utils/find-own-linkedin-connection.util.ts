import {
  type AppConnection,
  listConnections,
  type LogicFunctionExecutionContext,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { LINKEDIN_PROVIDER_NAME } from 'src/constants/linkedin-provider-name.constant';

export const findOwnLinkedinConnection = async (
  context: Pick<LogicFunctionExecutionContext, 'userWorkspaceId'>,
): Promise<AppConnection | undefined> => {
  if (!isDefined(context.userWorkspaceId)) {
    return undefined;
  }

  const connections = await listConnections({
    providerName: LINKEDIN_PROVIDER_NAME,
  });

  return connections.find(
    (connection) => connection.userWorkspaceId === context.userWorkspaceId,
  );
};
