import { isNonEmptyString } from '@sniptt/guards';
import { type WhatsAppIdentity } from 'src/logic-functions/types/whatsapp-identity.type';

// a conversation keeps the key it started with, so a template sent by phone number and the
// customer's reply keyed by user ID stay in one thread; new conversations prefer the stable user ID
export const selectWhatsAppThreadExternalId = ({
  groupId,
  customerIdentity,
  existingThreadExternalIds,
}: {
  groupId?: string;
  customerIdentity: WhatsAppIdentity;
  existingThreadExternalIds: string[];
}): string | undefined => {
  if (isNonEmptyString(groupId)) {
    return groupId;
  }

  const candidates = [customerIdentity.whatsAppUserId, customerIdentity.whatsAppId].filter(isNonEmptyString);

  return candidates.find((candidate) => existingThreadExternalIds.includes(candidate)) ?? candidates[0];
};
