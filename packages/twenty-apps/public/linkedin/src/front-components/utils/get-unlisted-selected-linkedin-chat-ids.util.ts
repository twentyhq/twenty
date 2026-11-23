import { type LinkedinChatOption } from 'src/types/linkedin-chat-option.type';

export const getUnlistedSelectedLinkedinChatIds = ({
  selectedChatIds,
  chats,
}: {
  selectedChatIds: string[];
  chats: Pick<LinkedinChatOption, 'id'>[];
}): string[] => {
  const listedChatIds = new Set(chats.map((chat) => chat.id));

  return selectedChatIds.filter((chatId) => !listedChatIds.has(chatId));
};
