import { isNonEmptyString } from '@sniptt/guards';
import { type WhatsAppIdentity } from 'src/logic-functions/types/whatsapp-identity.type';

// the user ID stays stable when a user hides or changes their phone number
export const buildWhatsAppThreadExternalId = ({
  groupId,
  customerIdentity,
}: {
  groupId?: string;
  customerIdentity: WhatsAppIdentity;
}): string | undefined =>
  [groupId, customerIdentity.whatsAppUserId, customerIdentity.whatsAppId].find(isNonEmptyString);
