import { type AiChatThreadActionsSurface } from '@/ai/constants/AiChatThreadActionsSurface';

export const getAiChatThreadDeleteModalId = (
  surface: AiChatThreadActionsSurface,
) => `delete-chat-thread-modal-${surface}`;
