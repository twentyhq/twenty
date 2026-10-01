import { type AiChatThreadActionsSurface } from '@/ai/types/AiChatThreadActionsSurface';

export const getAiChatThreadActionsInstanceId = ({
  threadId,
  surface,
}: {
  threadId: string;
  surface: AiChatThreadActionsSurface;
}) => `ai-chat-thread-actions-${surface}-${threadId}`;
