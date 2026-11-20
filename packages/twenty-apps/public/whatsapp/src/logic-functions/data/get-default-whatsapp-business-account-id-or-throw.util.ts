import { getConnectedWhatsAppBusinessAccountIds } from 'src/logic-functions/data/get-connected-whatsapp-business-account-ids.util';

export const getDefaultWhatsAppBusinessAccountIdOrThrow = async (): Promise<string> => {
  const whatsAppBusinessAccountIds = await getConnectedWhatsAppBusinessAccountIds();
  const [whatsAppBusinessAccountId, ...otherWhatsAppBusinessAccountIds] = whatsAppBusinessAccountIds;

  if (whatsAppBusinessAccountId === undefined) {
    throw new Error('No WhatsApp Business Account is connected');
  }

  if (otherWhatsAppBusinessAccountIds.length > 0) {
    throw new Error(
      `Several WhatsApp Business Accounts are connected, pass one of: ${whatsAppBusinessAccountIds.join(', ')}`,
    );
  }

  return whatsAppBusinessAccountId;
};
