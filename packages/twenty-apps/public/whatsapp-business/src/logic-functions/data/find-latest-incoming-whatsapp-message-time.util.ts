import { isNonEmptyString } from '@sniptt/guards';
import { type WhatsAppConversationMessage } from 'src/logic-functions/types/whatsapp-conversation-message.type';

export const findLatestIncomingWhatsAppMessageTime = (messages: WhatsAppConversationMessage[]): Date | undefined => {
  const incomingSentAts = messages
    .filter(({ direction }) => direction === 'INCOMING')
    .map(({ sentAt }) => sentAt)
    .filter(isNonEmptyString)
    .sort();
  const latestIncomingSentAt = incomingSentAts[incomingSentAts.length - 1];

  return isNonEmptyString(latestIncomingSentAt) ? new Date(latestIncomingSentAt) : undefined;
};
