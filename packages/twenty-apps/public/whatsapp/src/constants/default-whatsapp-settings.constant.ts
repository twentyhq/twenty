import { type WhatsappSettings } from 'src/types/whatsapp-settings.type';

export const DEFAULT_WHATSAPP_SETTINGS: WhatsappSettings = {
  importPolicy: 'ALL',
  selectedChats: [],
  areGroupChatsImported: true,
  historyConversationLimit: 20,
  contactAutoCreationPolicy: 'SENT',
  areChatsMarkedAsRead: false,
};
