import { type AiChatReplyStatus } from '@/ai-chat/types/AiChatReplyStatus';

// A reply still streaming keeps its status; its own end moves the thread on
export const getAiChatReplyStatusUnlessStreaming =
  (nextReplyStatus: AiChatReplyStatus) =>
  (replyStatus: AiChatReplyStatus): AiChatReplyStatus =>
    replyStatus === 'streaming' ? replyStatus : nextReplyStatus;
