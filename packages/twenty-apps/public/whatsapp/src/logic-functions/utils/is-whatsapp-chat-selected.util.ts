import { type WhatsappSettings } from 'src/types/whatsapp-settings.type';

export const isWhatsappChatSelected = ({
  settings,
  chatId,
}: {
  settings: Pick<WhatsappSettings, 'importPolicy' | 'selectedChats'>;
  chatId: string;
}): boolean =>
  settings.importPolicy !== 'SELECTED' ||
  settings.selectedChats.some((chat) => chat.id === chatId);
