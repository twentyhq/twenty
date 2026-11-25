import { callTelegramApiOrThrow } from 'src/logic-functions/utils/call-telegram-api-or-throw';

export const sendTelegramMessage = async ({
  botToken,
  chatId,
  text,
}: {
  botToken: string;
  chatId: number;
  text: string;
}): Promise<void> => {
  await callTelegramApiOrThrow({
    botToken,
    method: 'sendMessage',
    params: { chat_id: chatId, text },
  });
};
