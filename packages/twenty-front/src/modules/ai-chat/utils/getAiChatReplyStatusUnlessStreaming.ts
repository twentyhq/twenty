import { type AiChatReplyStatus } from '@/ai-chat/types/AiChatReplyStatus';

export const getAiChatReplyStatusUnlessStreaming =
  (nextReplyStatus: AiChatReplyStatus) =>
  (replyStatus: AiChatReplyStatus): AiChatReplyStatus =>
    replyStatus === 'streaming' ? replyStatus : nextReplyStatus;
