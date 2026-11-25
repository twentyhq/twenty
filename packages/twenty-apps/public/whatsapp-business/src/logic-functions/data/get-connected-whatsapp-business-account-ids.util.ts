import { listConnections } from 'twenty-sdk/logic-function';
import { WHATSAPP_CONNECTION_PROVIDER_NAME } from 'src/constants/whatsapp-connection-provider-name.constant';
import { getWhatsAppBusinessAccountIdsOfConnection } from 'src/logic-functions/data/get-whatsapp-business-account-ids-of-connection.util';

export const getConnectedWhatsAppBusinessAccountIds = async (): Promise<string[]> => {
  const connections = await listConnections({ providerName: WHATSAPP_CONNECTION_PROVIDER_NAME });

  const whatsAppBusinessAccountIds = await Promise.all(
    connections.map(({ id }) => getWhatsAppBusinessAccountIdsOfConnection(id)),
  );

  return [...new Set(whatsAppBusinessAccountIds.flat())];
};
