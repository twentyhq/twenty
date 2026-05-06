import { type AiChatThreadActionsSurface } from '@/ai/types/AiChatThreadActionsSurface';

export const getAiChatThreadItemMenuDropdownId = (
  threadId: string,
  surface: AiChatThreadActionsSurface,
) => `ai-chat-thread-item-menu-${surface}-${threadId}`;
