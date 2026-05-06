import { type AiChatThreadActionsSurface } from '@/ai/types/AiChatThreadActionsSurface';

export const getAiChatThreadFilterDropdownId = (
  surface: AiChatThreadActionsSurface,
) => `ai-chat-thread-filter-${surface}`;
