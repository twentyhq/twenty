import { type WhatsappSelectedChat } from 'src/types/whatsapp-selected-chat.type';

export const getUnlistedSelectedWhatsappChats = ({
  selectedChats,
  listedChatIds,
}: {
  selectedChats: WhatsappSelectedChat[];
  listedChatIds: string[];
}): WhatsappSelectedChat[] => {
  const listedChatIdSet = new Set(listedChatIds);

  return selectedChats.filter((chat) => !listedChatIdSet.has(chat.id));
};
