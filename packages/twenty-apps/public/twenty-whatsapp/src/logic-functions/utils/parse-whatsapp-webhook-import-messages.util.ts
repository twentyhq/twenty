import { type ImportMessage } from 'src/logic-functions/types/import-message.type';
import { type WhatsappWebhookBody } from 'src/logic-functions/types/whatsapp-webhook-body.type';
import { type WhatsappWebhookValue } from 'src/logic-functions/types/whatsapp-webhook-value.type';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

const parseChangeValue = (value: WhatsappWebhookValue): ImportMessage[] => {
  const businessHandle =
    value.metadata?.display_phone_number ?? value.metadata?.phone_number_id;

  if (!isNonEmptyString(businessHandle)) {
    return [];
  }

  return (value.messages ?? []).flatMap((message) => {
    const text = message.text?.body;

    if (
      message.type !== 'text' ||
      !isNonEmptyString(message.id) ||
      !isNonEmptyString(message.from) ||
      !isNonEmptyString(message.timestamp) ||
      !isNonEmptyString(text)
    ) {
      return [];
    }

    const senderName = value.contacts?.find(
      (contact) => contact.wa_id === message.from,
    )?.profile?.name;

    return [
      {
        externalId: message.id,
        messageThreadExternalId: message.from,
        headerMessageId: message.id,
        text,
        receivedAt: new Date(Number(message.timestamp) * 1000).toISOString(),
        direction: 'INCOMING' as const,
        participants: [
          {
            role: 'FROM' as const,
            handle: message.from,
            displayName: senderName,
          },
          {
            role: 'TO' as const,
            handle: businessHandle,
          },
        ],
      },
    ];
  });
};

export const parseWhatsappWebhookImportMessages = (
  body: WhatsappWebhookBody | null,
): ImportMessage[] => {
  if (body === null || body.object !== 'whatsapp_business_account') {
    return [];
  }

  return (body.entry ?? []).flatMap((entry) =>
    (entry.changes ?? []).flatMap((change) =>
      change.field === 'messages' && change.value !== undefined
        ? parseChangeValue(change.value)
        : [],
    ),
  );
};
