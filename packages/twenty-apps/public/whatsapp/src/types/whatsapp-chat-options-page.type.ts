import { type WhatsappChatOption } from 'src/types/whatsapp-chat-option.type';

export type WhatsappChatOptionsPage = {
  chats: WhatsappChatOption[];
  hasMore: boolean;
};
