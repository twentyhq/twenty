import { isNonEmptyString } from '@sniptt/guards';
import { getConnection } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';
import { findConnectedAccountIdByWhatsAppBusinessAccountId } from 'src/logic-functions/data/find-connected-account-id-by-whatsapp-business-account-id.util';

const getConnectedAccountIdOrThrow = async (whatsAppBusinessAccountId: string) => {
  const connectedAccountId = await findConnectedAccountIdByWhatsAppBusinessAccountId(whatsAppBusinessAccountId);

  if (!isDefined(connectedAccountId)) {
    throw new Error(`WhatsApp Business Account ${whatsAppBusinessAccountId} is not connected`);
  }

  return connectedAccountId;
};

export const getWhatsAppAccessTokenOrThrow = async (
  params: { connectedAccountId: string } | { whatsAppBusinessAccountId: string },
): Promise<string> => {
  const connectedAccountId =
    'connectedAccountId' in params
      ? params.connectedAccountId
      : await getConnectedAccountIdOrThrow(params.whatsAppBusinessAccountId);

  const { accessToken } = await getConnection(connectedAccountId);

  if (!isNonEmptyString(accessToken)) {
    throw new Error(`WhatsApp connection ${connectedAccountId} has no access token`);
  }

  return accessToken;
};
