import { TELEGRAM_TYPING_REFRESH_INTERVAL_MS } from 'src/logic-functions/constants/telegram-typing-refresh-interval-ms';
import { callTelegramApiOrThrow } from 'src/logic-functions/utils/call-telegram-api-or-throw';

export const startTelegramTyping = ({
  botToken,
  chatId,
}: {
  botToken: string;
  chatId: number;
}): (() => void) => {
  const sendTyping = () => {
    callTelegramApiOrThrow({
      botToken,
      method: 'sendChatAction',
      params: { chat_id: chatId, action: 'typing' },
    }).catch((error: unknown) => {
      console.warn('[telegram] could not show the typing status', error);
    });
  };

  sendTyping();

  const timer = setInterval(sendTyping, TELEGRAM_TYPING_REFRESH_INTERVAL_MS);

  return () => clearInterval(timer);
};
