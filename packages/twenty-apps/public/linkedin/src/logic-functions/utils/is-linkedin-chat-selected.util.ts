import { type LinkedinSettings } from 'src/types/linkedin-settings.type';

export const isLinkedinChatSelected = ({
  settings,
  chatId,
}: {
  settings: Pick<LinkedinSettings, 'importPolicy' | 'selectedChatIds'>;
  chatId: string;
}): boolean =>
  settings.importPolicy !== 'SELECTED' ||
  settings.selectedChatIds.includes(chatId);
