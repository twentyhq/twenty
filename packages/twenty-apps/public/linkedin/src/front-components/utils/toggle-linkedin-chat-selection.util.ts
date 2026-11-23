import { type LinkedinSelectedChat } from 'src/types/linkedin-selected-chat.type';

export const toggleLinkedinChatSelection = ({
  selectedChats,
  chats,
}: {
  selectedChats: LinkedinSelectedChat[];
  chats: LinkedinSelectedChat[];
}): LinkedinSelectedChat[] => {
  const toggledChatIds = new Set(chats.map((chat) => chat.id));

  return selectedChats.some((chat) => toggledChatIds.has(chat.id))
    ? selectedChats.filter((chat) => !toggledChatIds.has(chat.id))
    : [...selectedChats, ...chats];
};
