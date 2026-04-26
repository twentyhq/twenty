import { type AiChatThreadActionsSurface } from '@/ai/constants/AiChatThreadActionsSurface';

export const getAiChatThreadFilterDropdownId = (
  surface: AiChatThreadActionsSurface,
) => `ai-chat-thread-filter-${surface}`;
