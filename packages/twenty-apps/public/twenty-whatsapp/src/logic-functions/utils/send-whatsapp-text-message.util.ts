import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

type GraphSendMessageResponse = {
  messages?: { id?: string }[];
  contacts?: { wa_id?: string }[];
  error?: { message?: string };
};

export const sendWhatsappTextMessage = async ({
  phoneNumberId,
  accessToken,
  to,
  body,
}: {
  phoneNumberId: string;
  accessToken: string;
  to: string;
  body: string;
}): Promise<{ messageExternalId: string; threadExternalId: string }> => {
  const response = await fetch(
    `https://graph.facebook.com/v23.0/${phoneNumberId}/messages`,
    {
      method: 'POST',
      headers: {
        authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body },
      }),
    },
  );

  const payload: GraphSendMessageResponse = await response
    .json()
    .catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      `WhatsApp send failed with status ${response.status}: ${payload.error?.message ?? 'unknown Graph API error'}`,
    );
  }

  const messageExternalId = payload.messages?.[0]?.id;

  if (!isNonEmptyString(messageExternalId)) {
    throw new Error(
      'WhatsApp send succeeded but the Graph API returned no message id',
    );
  }

  return {
    messageExternalId,
    threadExternalId: payload.contacts?.[0]?.wa_id ?? to,
  };
};
