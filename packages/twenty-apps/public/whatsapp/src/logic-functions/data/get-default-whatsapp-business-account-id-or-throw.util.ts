import { getConnectedWhatsappBusinessAccountIds } from 'src/logic-functions/data/get-connected-whatsapp-business-account-ids.util';

export const getDefaultWhatsappBusinessAccountIdOrThrow = async (): Promise<string> => {
  const whatsappBusinessAccountIds = await getConnectedWhatsappBusinessAccountIds();
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
