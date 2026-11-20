import { isBusinessScopedUserId } from 'src/logic-functions/data/is-business-scoped-user-id.util';
import { normalizeWhatsAppPhoneNumber } from 'src/logic-functions/data/normalize-whatsapp-phone-number.util';
import { type WhatsAppIdentity } from 'src/logic-functions/types/whatsapp-identity.type';

export const getRecipientWhatsAppIdentity = (recipient: string): WhatsAppIdentity =>
  isBusinessScopedUserId(recipient)
    ? { whatsAppUserId: recipient }
    : { whatsAppId: normalizeWhatsAppPhoneNumber(recipient) };
