import { type WhatsappSettings } from 'src/types/whatsapp-settings.type';

export const hasWhatsappHistoryToImport = ({
  importPolicy,
  selectedChats,
}: Pick<WhatsappSettings, 'importPolicy' | 'selectedChats'>): boolean =>
  importPolicy !== 'SELECTED' || selectedChats.length > 0;
