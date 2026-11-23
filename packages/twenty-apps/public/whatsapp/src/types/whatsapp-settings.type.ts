import { type WhatsappContactAutoCreationPolicy } from 'src/types/whatsapp-contact-auto-creation-policy.type';
import { type WhatsappHistoryConversationLimit } from 'src/types/whatsapp-history-conversation-limit.type';
import { type WhatsappImportPolicy } from 'src/types/whatsapp-import-policy.type';

export type WhatsappSettings = {
  importPolicy: WhatsappImportPolicy;
  selectedChatIds: string[];
  areGroupChatsImported: boolean;
  historyConversationLimit: WhatsappHistoryConversationLimit;
  contactAutoCreationPolicy: WhatsappContactAutoCreationPolicy;
  areChatsMarkedAsRead: boolean;
};
