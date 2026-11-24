import { type LinkedinSettings } from 'src/types/linkedin-settings.type';

export const hasLinkedinHistoryToImport = ({
  importPolicy,
  selectedChats,
  historyConversationLimit,
}: Pick<
  LinkedinSettings,
  'importPolicy' | 'selectedChats' | 'historyConversationLimit'
>): boolean => {
  if (importPolicy === 'SELECTED') {
    return selectedChats.length > 0;
  }

  return historyConversationLimit > 0;
};
