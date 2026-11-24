import { callTelegramApi } from 'src/logic-functions/utils/call-telegram-api';

export const sendTelegramMessage = async ({
  botToken,
  chatId,
  text,
}: {
  botToken: string;
  chatId: number;
  text: string;
}): Promise<void> => {
  await callTelegramApi({
    botToken,
    method: 'sendMessage',
    params: { chat_id: chatId, text },
  });
};
