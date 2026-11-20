import { whatsAppApiRequest } from 'src/logic-functions/data/whatsapp-api-request.util';
import { type WhatsAppApiPhoneNumber } from 'src/logic-functions/types/whatsapp-api.type';

export const getWhatsAppBusinessAccountPhoneNumbers = async ({
  accessToken,
  whatsAppBusinessAccountId,
}: {
  accessToken: string;
  whatsAppBusinessAccountId: string;
}): Promise<WhatsAppApiPhoneNumber[]> => {
  const phoneNumbers: WhatsAppApiPhoneNumber[] = [];
  let after: string | undefined;

  do {
    const response = await whatsAppApiRequest({
      accessToken,
      endpoint: 'GET /{wabaId}/phone_numbers',
      pathParams: { wabaId: whatsAppBusinessAccountId },
      query: { after, fields: 'id,display_phone_number,verified_name,quality_rating,messaging_limit_tier,status,name_status' },
    });

    phoneNumbers.push(...response.data);
    after = response.paging?.next ? response.paging.cursors.after : undefined;
  } while (after !== undefined);

  return phoneNumbers;
};
