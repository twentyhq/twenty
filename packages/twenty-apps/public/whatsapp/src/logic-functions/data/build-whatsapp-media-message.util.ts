import { type WhatsAppReplyContent } from 'src/logic-functions/types/whatsapp-reply-content.type';

export const buildWhatsAppMediaMessage = ({
  mediaId,
  contentType,
  filename,
}: {
  mediaId: string;
  contentType: string;
  filename: string;
}): Exclude<WhatsAppReplyContent, { type: 'text' }> => {
  if (contentType.startsWith('image/')) {
    return { type: 'image', image: { id: mediaId } };
  }

  if (contentType.startsWith('video/')) {
    return { type: 'video', video: { id: mediaId } };
  }

  if (contentType.startsWith('audio/')) {
    return { type: 'audio', audio: { id: mediaId } };
  }

  return { type: 'document', document: { id: mediaId, filename } };
};
