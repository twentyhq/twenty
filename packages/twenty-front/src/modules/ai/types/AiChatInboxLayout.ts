import { type AI_CHAT_INBOX_LAYOUT } from '@/ai/constants/AiChatInboxLayout';

export type AiChatInboxLayout =
  (typeof AI_CHAT_INBOX_LAYOUT)[keyof typeof AI_CHAT_INBOX_LAYOUT];
