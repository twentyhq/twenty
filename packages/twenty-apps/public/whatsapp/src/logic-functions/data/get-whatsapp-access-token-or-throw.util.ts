import { isNonEmptyString } from '@sniptt/guards';
import { getConnection, listConnections } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';
import { WHATSAPP_CONNECTION_PROVIDER_NAME } from 'src/constants/whatsapp-connection-provider-name.constant';

// Without a connected account id, the first WhatsApp connection of the workspace is used
export const getWhatsappAccessTokenOrThrow = async ({
  connectedAccountId,
}: { connectedAccountId?: string } = {}): Promise<string> => {
  const connection = isDefined(connectedAccountId)
    ? await getConnection(connectedAccountId)
    : (await listConnections({ providerName: WHATSAPP_CONNECTION_PROVIDER_NAME }))[0];

  if (!isDefined(connection) || !isNonEmptyString(connection.accessToken)) {
    throw new Error(
      isDefined(connectedAccountId)
        ? `WhatsApp connection ${connectedAccountId} has no access token`
        : 'No WhatsApp connection found, connect a WhatsApp account first',
    );
  }

  return connection.accessToken;
};
