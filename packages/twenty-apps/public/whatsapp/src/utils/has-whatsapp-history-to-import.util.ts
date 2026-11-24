import { type WhatsappSettings } from 'src/types/whatsapp-settings.type';

export const hasWhatsappHistoryToImport = ({
  importPolicy,
  selectedChats,
  historyConversationLimit,
}: Pick<
  WhatsappSettings,
  'importPolicy' | 'selectedChats' | 'historyConversationLimit'
>): boolean => {
  if (importPolicy === 'SELECTED') {
    return selectedChats.length > 0;
  }

  return historyConversationLimit > 0;
};
