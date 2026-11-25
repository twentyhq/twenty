import { isNonEmptyString } from '@sniptt/guards';
import { type ParseMessagePayload } from 'src/logic-functions/types/parse-message-payload.type';
import {
  type WhatsAppHistoryValue,
  type WhatsAppWebhookMessageBusinessData,
} from 'src/logic-functions/types/whatsapp-webhook-message.type';

export const buildHistoryParseMessagePayloads = ({
  whatsAppBusinessAccountId,
  businessData,
  chunks,
}: {
  whatsAppBusinessAccountId: string;
  businessData: WhatsAppWebhookMessageBusinessData;
  chunks: WhatsAppHistoryValue['history'];
}): ParseMessagePayload[] =>
  chunks.flatMap((chunk) => {
    if (!('threads' in chunk)) {
      return [];
    }

    return chunk.threads.flatMap((thread) => {
      const customerWhatsAppId = thread.id ?? thread.context?.wa_id;
      const customerWhatsAppUserId = thread.context?.user_id;

      if (!isNonEmptyString(customerWhatsAppId) && !isNonEmptyString(customerWhatsAppUserId)) {
        return [];
      }

      return thread.messages.map((message) => ({
        whatsAppBusinessAccountId,
        businessData,
        contacts: {
          wa_id: customerWhatsAppId,
          user_id: customerWhatsAppUserId,
          profile: { name: '' },
        },
        messages: message,
      }));
    });
  });
