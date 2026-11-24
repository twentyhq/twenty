import { type AI_CHAT_SURFACE } from '@/ai-chat/constants/AiChatSurface';

export type AiChatSurface =
  (typeof AI_CHAT_SURFACE)[keyof typeof AI_CHAT_SURFACE];
