import { type WHATSAPP_HISTORY_CONVERSATION_LIMITS } from 'src/constants/whatsapp-history-conversation-limits.constant';

export type WhatsappHistoryConversationLimit =
  (typeof WHATSAPP_HISTORY_CONVERSATION_LIMITS)[number];
