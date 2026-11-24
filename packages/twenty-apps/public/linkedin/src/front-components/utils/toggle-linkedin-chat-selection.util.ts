import { type LinkedinSelectedChat } from 'src/types/linkedin-selected-chat.type';

export const toggleLinkedinChatSelection = ({
  selectedChats,
  chat,
}: {
  selectedChats: LinkedinSelectedChat[];
  chat: LinkedinSelectedChat;
}): LinkedinSelectedChat[] =>
  selectedChats.some(({ id }) => id === chat.id)
    ? selectedChats.filter(({ id }) => id !== chat.id)
    : [...selectedChats, chat];
