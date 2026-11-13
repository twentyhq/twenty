import { type INBOX_LAYOUT } from '@/ai/constants/AiChatInboxLayout';

export type InboxLayout = (typeof INBOX_LAYOUT)[keyof typeof INBOX_LAYOUT];
