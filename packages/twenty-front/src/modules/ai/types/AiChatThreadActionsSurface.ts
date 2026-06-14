import { type AI_CHAT_THREAD_ACTIONS_SURFACE } from '@/ai/constants/AiChatThreadActionsSurface';

export type AiChatThreadActionsSurface =
  (typeof AI_CHAT_THREAD_ACTIONS_SURFACE)[keyof typeof AI_CHAT_THREAD_ACTIONS_SURFACE];
