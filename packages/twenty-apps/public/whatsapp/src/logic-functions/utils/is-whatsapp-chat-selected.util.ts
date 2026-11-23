import { type WhatsappSettings } from 'src/types/whatsapp-settings.type';

export const isWhatsappChatSelected = ({
  settings,
  chatId,
}: {
  settings: Pick<WhatsappSettings, 'importPolicy' | 'selectedChatIds'>;
  chatId: string;
}): boolean =>
  settings.importPolicy !== 'SELECTED' ||
  settings.selectedChatIds.includes(chatId);
