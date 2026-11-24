import { type LinkedinSelectedChat } from 'src/types/linkedin-selected-chat.type';

export const toggleLinkedinChatSelection = ({
  selectedChats,
  chats,
}: {
  selectedChats: LinkedinSelectedChat[];
  chats: LinkedinSelectedChat[];
}): LinkedinSelectedChat[] => {
  const toggledChatIds = new Set(chats.map(({ id }) => id));
  const unselectedChats = selectedChats.filter(
    ({ id }) => !toggledChatIds.has(id),
  );

  return unselectedChats.length < selectedChats.length
    ? unselectedChats
    : [...selectedChats, ...chats];
};
