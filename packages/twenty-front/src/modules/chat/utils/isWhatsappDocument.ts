import { WhatsappDocument } from '@/chat/types/WhatsappDocument';

export const isWhatsappDocument = (
  chat: WhatsappDocument | undefined, // | FacebookDocument
): chat is WhatsappDocument => {
  return chat !== undefined && 'phone' in chat.client;
};
