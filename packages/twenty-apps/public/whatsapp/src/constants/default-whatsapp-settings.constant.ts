import { type WhatsappSettings } from 'src/types/whatsapp-settings.type';

export const DEFAULT_WHATSAPP_SETTINGS: WhatsappSettings = {
  importPolicy: 'CONTACTS_ONLY',
  selectedChats: [],
  contactAutoCreationPolicy: 'SENT',
  areChatsMarkedAsRead: false,
};
