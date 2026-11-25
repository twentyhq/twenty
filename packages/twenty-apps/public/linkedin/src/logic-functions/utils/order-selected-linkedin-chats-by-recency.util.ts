import { type LinkedinSelectedChat } from 'src/types/linkedin-selected-chat.type';
import { type UnipileChat } from 'src/unipile/types/unipile-chat.type';

export const orderSelectedLinkedinChatsByRecency = ({
  selectedChats,
  recentChats,
}: {
  selectedChats: LinkedinSelectedChat[];
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
