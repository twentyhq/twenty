import { whatsappApiRequest } from 'src/logic-functions/data/whatsapp-api-request.util';
import { type WhatsAppApiPhoneNumber } from 'src/logic-functions/types/whatsapp-api.type';

export const getWhatsappBusinessAccountPhoneNumbers = async (
  wabaId: string,
): Promise<WhatsAppApiPhoneNumber[]> => {
  const phoneNumbers: WhatsAppApiPhoneNumber[] = [];
  let after: string | undefined;

  do {
    const response = await whatsappApiRequest({
      endpoint: 'GET /{wabaId}/phone_numbers',
      pathParams: { wabaId },
      query: { after },
    });

    phoneNumbers.push(...response.data);
    after = response.paging?.next ? response.paging.cursors.after : undefined;
  } while (after !== undefined);

  return phoneNumbers;
};
