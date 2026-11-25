import { type WhatsappSelectedChat } from 'src/types/whatsapp-selected-chat.type';
import { type UnipileChat } from 'src/unipile/types/unipile-chat.type';

export const orderSelectedWhatsappChatsByRecency = ({
  selectedChats,
  recentChats,
}: {
  selectedChats: WhatsappSelectedChat[];
  recentChats: UnipileChat[];
}): UnipileChat[] => {
  const selectedChatIds = new Set(selectedChats.map(({ id }) => id));
  const recentSelectedChats = recentChats.filter(({ id }) =>
    selectedChatIds.has(id),
  );
  const recentSelectedChatIds = new Set(
    recentSelectedChats.map(({ id }) => id),
  );

  return [
    ...recentSelectedChats,
    ...selectedChats
      .filter(({ id }) => !recentSelectedChatIds.has(id))
      .map(({ id, name }) => ({ id, name, is_group: false, is_1to1: false })),
  ];
};
