import { type AiChatSurface } from '@/ai/types/AiChatSurface';

export const getAiChatScrollWrapperInstanceId = (surface: AiChatSurface) =>
  `ai-chat-scroll-wrapper-${surface}`;
