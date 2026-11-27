import { Response } from 'twenty-sdk/logic-function';

export const buildTelegramCallbackQueryWebhookReply = ({
  callbackQueryId,
  text,
}: {
  callbackQueryId: string;
  text: string;
}): Response =>
  new Response(
    {
      method: 'answerCallbackQuery',
      callback_query_id: callbackQueryId,
      text,
    },
    { headers: { 'content-type': 'application/json' } },
  );
