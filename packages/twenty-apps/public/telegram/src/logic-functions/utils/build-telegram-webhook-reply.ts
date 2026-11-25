import { Response } from 'twenty-sdk/logic-function';

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
