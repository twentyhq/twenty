import { isNonEmptyString } from '@sniptt/guards';
import { type WhatsappIdentity } from 'src/logic-functions/types/whatsapp-identity.type';

export const isSameWhatsappIdentity = (
  identity: WhatsappIdentity,
  otherIdentity: WhatsappIdentity,
): boolean =>
  (isNonEmptyString(identity.whatsAppUserId) &&
    identity.whatsAppUserId === otherIdentity.whatsAppUserId) ||
  (isNonEmptyString(identity.whatsAppId) && identity.whatsAppId === otherIdentity.whatsAppId);
