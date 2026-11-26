import { type WhatsappContactAutoCreationPolicy } from 'src/types/whatsapp-contact-auto-creation-policy.type';

export const isWhatsappContactCreationAllowed = ({
  policy,
  hasUserSentMessage,
}: {
  policy: WhatsappContactAutoCreationPolicy;
  hasUserSentMessage: boolean;
}): boolean =>
  policy === 'SENT_AND_RECEIVED' || (policy === 'SENT' && hasUserSentMessage);
