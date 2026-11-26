import { type WhatsappContactAutoCreationPolicy } from 'src/types/whatsapp-contact-auto-creation-policy.type';
import { type WhatsappImportPolicy } from 'src/types/whatsapp-import-policy.type';
import { type WhatsappSelectedChat } from 'src/types/whatsapp-selected-chat.type';

export type WhatsappSettings = {
  importPolicy: WhatsappImportPolicy;
  selectedChats: WhatsappSelectedChat[];
  contactAutoCreationPolicy: WhatsappContactAutoCreationPolicy;
  areChatsMarkedAsRead: boolean;
};
