import { type WhatsAppWebhookMessageContent } from 'src/logic-functions/types/whatsapp-webhook-message.type';

type EditedMessage = Extract<WhatsAppWebhookMessageContent, { type: 'edit' }>['edit']['message'];

export const getEditedMessageText = (editedMessage: EditedMessage): string => {
  switch (editedMessage.type) {
    case 'text':
      return editedMessage.text.body;
    case 'image':
      return editedMessage.image.caption ?? '';
    case 'video':
      return editedMessage.video.caption ?? '';
    case 'document':
      return editedMessage.document.caption ?? '';
  }
};
