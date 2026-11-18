import { type AiChatSurface } from '@/ai-chat/types/AiChatSurface';

export const getAiChatScrollWrapperInstanceId = (surface: AiChatSurface) =>
  `ai-chat-scroll-wrapper-${surface}`;
