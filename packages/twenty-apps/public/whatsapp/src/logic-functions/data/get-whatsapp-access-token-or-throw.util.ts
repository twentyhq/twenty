import { isNonEmptyString } from '@sniptt/guards';
import { getConnection } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';
import { findConnectedAccountIdByWhatsappBusinessAccountId } from 'src/logic-functions/data/find-connected-account-id-by-whatsapp-business-account-id.util';

const getConnectedAccountIdOrThrow = async (whatsappBusinessAccountId: string) => {
  const connectedAccountId = await findConnectedAccountIdByWhatsappBusinessAccountId(whatsappBusinessAccountId);

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
