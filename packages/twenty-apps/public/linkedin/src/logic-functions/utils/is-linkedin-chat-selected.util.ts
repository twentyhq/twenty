import { type LinkedinSettings } from 'src/types/linkedin-settings.type';

export const isLinkedinChatSelected = ({
  settings,
  chatId,
}: {
  settings: Pick<LinkedinSettings, 'importPolicy' | 'selectedChats'>;
  chatId: string;
}): boolean =>
  settings.importPolicy !== 'SELECTED' ||
  settings.selectedChats.some((chat) => chat.id === chatId);
