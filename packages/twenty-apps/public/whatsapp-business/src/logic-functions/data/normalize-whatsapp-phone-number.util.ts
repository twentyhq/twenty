// WhatsApp identifies numbers by their digits only, without +, spaces or punctuation
export const normalizeWhatsAppPhoneNumber = (phoneNumber: string) => phoneNumber.replace(/\D/g, '');
