import { Response } from 'twenty-sdk/logic-function';

// Telegram runs a Bot API method returned as the webhook response, which
// answers without the resolver making an outbound call.
export const buildTelegramWebhookReply = ({
  chatId,
  text,
}: {
  chatId: number;
  text: string;
}): Response =>
  new Response(
    { method: 'sendMessage', chat_id: chatId, text },
    { headers: { 'content-type': 'application/json' } },
  );
