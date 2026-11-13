import { type INBOX_SURFACE } from '@/ai/constants/AiChatSurface';

export type InboxSurface = (typeof INBOX_SURFACE)[keyof typeof INBOX_SURFACE];
