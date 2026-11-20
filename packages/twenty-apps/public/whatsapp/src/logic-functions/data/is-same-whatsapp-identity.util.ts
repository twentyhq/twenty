import { isNonEmptyString } from '@sniptt/guards';
import { type WhatsAppIdentity } from 'src/logic-functions/types/whatsapp-identity.type';

export const isSameWhatsAppIdentity = (
  identity: WhatsAppIdentity,
  otherIdentity: WhatsAppIdentity,
): boolean =>
  (isNonEmptyString(identity.whatsAppUserId) &&
    identity.whatsAppUserId === otherIdentity.whatsAppUserId) ||
  (isNonEmptyString(identity.whatsAppId) && identity.whatsAppId === otherIdentity.whatsAppId);
