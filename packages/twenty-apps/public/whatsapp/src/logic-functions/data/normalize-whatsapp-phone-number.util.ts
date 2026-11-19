import { formatWhatsappPhoneNumberUtil } from 'src/logic-functions/data/format-whatsapp-phone-number.util';

export const normalizeWhatsappPhoneNumber = (phoneNumber: string) =>
  formatWhatsappPhoneNumberUtil(phoneNumber).replace(/^\+/, '');
