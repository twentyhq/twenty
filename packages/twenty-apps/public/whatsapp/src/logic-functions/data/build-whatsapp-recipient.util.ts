// a business-scoped user ID is a two-letter country code, a period and up to 128 alphanumeric characters
const BUSINESS_SCOPED_USER_ID_PATTERN = /^[A-Z]{2}\.[A-Za-z0-9]{1,128}$/;

export const buildWhatsAppRecipient = (recipient: string): { to: string } | { recipient: string } =>
  BUSINESS_SCOPED_USER_ID_PATTERN.test(recipient) ? { recipient } : { to: recipient };
