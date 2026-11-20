import { isNonEmptyString } from '@sniptt/guards';
import { type WhatsAppWebhookMessageContent } from 'src/logic-functions/types/whatsapp-webhook-message.type';

type InteractiveReply = Extract<WhatsAppWebhookMessageContent, { type: 'interactive' }>['interactive'];

export const getInteractiveMessageText = (interactiveReply: InteractiveReply): string => {
  switch (interactiveReply.type) {
    case 'list_reply':
      return [interactiveReply.list_reply.title, interactiveReply.list_reply.description]
        .filter(isNonEmptyString)
        .join(' - ');
    case 'button_reply':
      return interactiveReply.button_reply.title;
    case 'nfm_reply':
      return [interactiveReply.nfm_reply.body, interactiveReply.nfm_reply.response_json]
        .filter(isNonEmptyString)
        .join('\n\n');
  }
};
