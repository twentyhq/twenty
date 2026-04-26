import { type AiChatThreadActionsSurface } from '@/ai/constants/AiChatThreadActionsSurface';

export const getAiChatThreadDeleteModalId = (
  threadId: string,
  surface: AiChatThreadActionsSurface,
) => `delete-chat-thread-modal-${surface}-${threadId}`;
