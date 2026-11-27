import { type WhatsappSelectedChat } from 'src/types/whatsapp-selected-chat.type';

export const toggleWhatsappChatSelection = ({
  selectedChats,
  chats,
}: {
  selectedChats: WhatsappSelectedChat[];
  chats: WhatsappSelectedChat[];
}): WhatsappSelectedChat[] => {
  const toggledChatIds = new Set(chats.map((chat) => chat.id));

  return selectedChats.some((chat) => toggledChatIds.has(chat.id))
    ? selectedChats.filter((chat) => !toggledChatIds.has(chat.id))
    : [...selectedChats, ...chats];
};
