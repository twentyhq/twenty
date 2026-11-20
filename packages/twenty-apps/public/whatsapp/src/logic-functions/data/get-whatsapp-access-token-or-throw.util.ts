import { isNonEmptyString } from '@sniptt/guards';
import { getConnection } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';
import { getWhatsappBusinessAccountConnections } from 'src/logic-functions/data/get-whatsapp-business-account-connections.util';

const getConnectedAccountIdOrThrow = async (whatsappBusinessAccountId: string) => {
  const connectedAccountId = (await getWhatsappBusinessAccountConnections())[whatsappBusinessAccountId];

  if (!isDefined(connectedAccountId)) {
    throw new Error(`WhatsApp Business Account ${whatsappBusinessAccountId} is not connected`);
  }

  return connectedAccountId;
};

export const getWhatsappAccessTokenOrThrow = async (
  params: { connectedAccountId: string } | { whatsappBusinessAccountId: string },
): Promise<string> => {
  const connectedAccountId =
    'connectedAccountId' in params
      ? params.connectedAccountId
      : await getConnectedAccountIdOrThrow(params.whatsappBusinessAccountId);

  const { accessToken } = await getConnection(connectedAccountId);

  if (!isNonEmptyString(accessToken)) {
    throw new Error(`WhatsApp connection ${connectedAccountId} has no access token`);
  }

  return accessToken;
};
