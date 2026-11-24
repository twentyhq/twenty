import { type AppConnection, listConnections } from 'twenty-sdk/logic-function';

import { WHATSAPP_PROVIDER_NAME } from 'src/constants/whatsapp-provider-name.constant';

export const findWhatsappConnectionByUnipileAccountId = async (
  unipileAccountId: string,
): Promise<AppConnection | undefined> => {
  const connections = await listConnections({
    providerName: WHATSAPP_PROVIDER_NAME,
  });

  return connections.find(
    (connection) => connection.externalAccountId === unipileAccountId,
  );
};
