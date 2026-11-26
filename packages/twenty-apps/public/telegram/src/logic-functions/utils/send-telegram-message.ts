import { type TelegramMessage } from 'src/logic-functions/types/telegram-message.type';
import { callTelegramApiOrThrow } from 'src/logic-functions/utils/call-telegram-api-or-throw';

export const sendTelegramMessage = ({
  botToken,
  chatId,
  text,
}: {
  botToken: string;
  chatId: number;
  text: string;
}): Promise<TelegramMessage> =>
  callTelegramApiOrThrow<TelegramMessage>({
    botToken,
    method: 'sendMessage',
    params: { chat_id: chatId, text },
  });
