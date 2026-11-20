import { getWhatsappBusinessAccountConnections } from 'src/logic-functions/data/get-whatsapp-business-account-connections.util';

export const getDefaultWhatsappBusinessAccountIdOrThrow = async (): Promise<string> => {
  const whatsappBusinessAccountIds = Object.keys(await getWhatsappBusinessAccountConnections());
  const [whatsappBusinessAccountId, ...otherWhatsappBusinessAccountIds] = whatsappBusinessAccountIds;

  if (whatsappBusinessAccountId === undefined) {
    throw new Error('No WhatsApp Business Account is connected');
  }

  if (otherWhatsappBusinessAccountIds.length > 0) {
    throw new Error(
      `Several WhatsApp Business Accounts are connected, pass one of: ${whatsappBusinessAccountIds.join(', ')}`,
    );
  }

  return whatsappBusinessAccountId;
};
