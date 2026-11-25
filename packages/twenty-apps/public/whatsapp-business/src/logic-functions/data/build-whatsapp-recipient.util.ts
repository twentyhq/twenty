import { isBusinessScopedUserId } from 'src/logic-functions/data/is-business-scoped-user-id.util';

export const buildWhatsAppRecipient = (recipient: string): { to: string } | { recipient: string } =>
  isBusinessScopedUserId(recipient) ? { recipient } : { to: recipient };
