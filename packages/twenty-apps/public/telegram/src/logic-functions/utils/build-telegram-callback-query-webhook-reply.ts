import { Response } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

export const buildTelegramCallbackQueryWebhookReply = ({
  callbackQueryId,
  text,
}: {
  callbackQueryId: string;
  text?: string;
}): Response =>
  new Response(
    {
      method: 'answerCallbackQuery',
      callback_query_id: callbackQueryId,
      ...(isDefined(text) ? { text } : {}),
    },
    { headers: { 'content-type': 'application/json' } },
  );
