import { type WhatsappChatOption } from 'src/types/whatsapp-chat-option.type';

export const getUnlistedSelectedWhatsappChatIds = ({
  selectedChatIds,
  chats,
}: {
  selectedChatIds: string[];
  chats: Pick<WhatsappChatOption, 'id'>[];
}): string[] => {
  const listedChatIds = new Set(chats.map((chat) => chat.id));

  return selectedChatIds.filter((chatId) => !listedChatIds.has(chatId));
};
