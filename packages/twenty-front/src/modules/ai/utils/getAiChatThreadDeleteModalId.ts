import { type AiChatThreadActionsSurface } from '@/ai/types/AiChatThreadActionsSurface';

export const getAiChatThreadDeleteModalId = (
  surface: AiChatThreadActionsSurface,
) => `delete-chat-thread-modal-${surface}`;
