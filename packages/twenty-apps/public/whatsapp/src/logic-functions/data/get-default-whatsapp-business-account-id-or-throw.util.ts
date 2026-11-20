import { getWhatsappBusinessAccountIdsOrThrow } from 'src/logic-functions/data/get-whatsapp-business-account-ids-or-throw.util';

export const getDefaultWhatsappBusinessAccountIdOrThrow = async ({
  accessToken,
}: {
  accessToken: string;
}): Promise<string> => {
  const { whatsappBusinessAccountIds } = await getWhatsappBusinessAccountIdsOrThrow({ accessToken });
  const [whatsappBusinessAccountId, ...otherWhatsappBusinessAccountIds] = whatsappBusinessAccountIds;

  if (whatsappBusinessAccountId === undefined || otherWhatsappBusinessAccountIds.length > 0) {
    throw new Error(
      `Several WhatsApp Business Accounts are connected, pass one of: ${whatsappBusinessAccountIds.join(', ')}`,
    );
  }

  return whatsappBusinessAccountId;
};
