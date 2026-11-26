import {
  type AppConnection,
  listConnections,
  type LogicFunctionExecutionContext,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { WHATSAPP_PROVIDER_NAME } from 'src/constants/whatsapp-provider-name.constant';

export const findOwnWhatsappConnection = async (
  context: Pick<LogicFunctionExecutionContext, 'userWorkspaceId'>,
): Promise<AppConnection | undefined> => {
  if (!isDefined(context.userWorkspaceId)) {
    return undefined;
  }

  const connections = await listConnections({
    providerName: WHATSAPP_PROVIDER_NAME,
  });

  return connections.find(
    (connection) => connection.userWorkspaceId === context.userWorkspaceId,
  );
};
