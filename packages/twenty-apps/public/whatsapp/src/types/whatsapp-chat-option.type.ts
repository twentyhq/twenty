export type WhatsappChatOption = {
  id: string;
  // WhatsApp can keep several chats with one person, shown as one conversation
  chatIds: string[];
  name: string;
  isGroup: boolean;
  lastMessageAt?: string;
};
