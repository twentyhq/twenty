import { type LinkedinSelectedChat } from 'src/types/linkedin-selected-chat.type';

export const getUnlistedSelectedLinkedinChats = ({
  selectedChats,
  listedChatIds,
}: {
  selectedChats: LinkedinSelectedChat[];
  listedChatIds: string[];
}): LinkedinSelectedChat[] => {
  const listedChatIdSet = new Set(listedChatIds);

  return selectedChats.filter((chat) => !listedChatIdSet.has(chat.id));
};
