import { isNonEmptyString } from '@sniptt/guards';
import { normalizeWhatsAppPhoneNumber } from 'src/logic-functions/data/normalize-whatsapp-phone-number.util';
import { type WhatsAppTemplateRecipientPerson } from 'src/logic-functions/types/whatsapp-template-recipient-person.type';

// people never seen on WhatsApp are reached on their primary phone number
export const getPersonWhatsAppRecipient = ({
  whatsAppId,
  whatsAppUserId,
  phones,
}: Pick<WhatsAppTemplateRecipientPerson, 'whatsAppId' | 'whatsAppUserId' | 'phones'>): string | undefined => {
  if (isNonEmptyString(whatsAppUserId)) {
    return whatsAppUserId;
  }

  if (isNonEmptyString(whatsAppId)) {
    return whatsAppId;
  }

  const phoneNumber = normalizeWhatsAppPhoneNumber(
    `${phones?.primaryPhoneCallingCode ?? ''}${phones?.primaryPhoneNumber ?? ''}`,
  );

  // a calling code alone is not a number
  return isNonEmptyString(phones?.primaryPhoneNumber) && isNonEmptyString(phoneNumber) ? phoneNumber : undefined;
};
