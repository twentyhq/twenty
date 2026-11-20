import { type WhatsAppReplyContent } from 'src/logic-functions/types/whatsapp-reply-content.type';

export const buildWhatsAppMediaMessage = ({
  mediaId,
  messageType,
  filename,
}: {
  mediaId: string;
  messageType: 'image' | 'video' | 'audio' | 'document';
  filename: string;
}): Exclude<WhatsAppReplyContent, { type: 'text' }> => {
  switch (messageType) {
    case 'image':
      return { type: 'image', image: { id: mediaId } };
    case 'video':
      return { type: 'video', video: { id: mediaId } };
    case 'audio':
      return { type: 'audio', audio: { id: mediaId } };
    case 'document':
      return { type: 'document', document: { id: mediaId, filename } };
  }
};
