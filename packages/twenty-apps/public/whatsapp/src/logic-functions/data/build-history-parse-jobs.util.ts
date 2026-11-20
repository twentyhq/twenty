import { isNonEmptyString } from '@sniptt/guards';
import { type WhatsAppHistoryValue } from 'src/logic-functions/types/whatsapp-webhook-message.type';

type HistoryChunk = WhatsAppHistoryValue['history'][number];

export const buildHistoryParseJobs = (
  businessData: { display_phone_number: string; phone_number_id: string },
  chunks: HistoryChunk[],
) =>
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
        payload: {
          businessData,
          contacts: {
            wa_id: customerWhatsAppId,
            user_id: customerWhatsAppUserId,
            profile: { name: '' },
          },
          messages: message,
        },
      }));
    });
  });
