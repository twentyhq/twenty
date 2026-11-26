import { type AiChatReplyStatus } from '@/ai-chat/types/AiChatReplyStatus';

export const endAiChatReplyStatus =
  (endedReplyStatus: AiChatReplyStatus) =>
  (replyStatus: AiChatReplyStatus): AiChatReplyStatus =>
    replyStatus === endedReplyStatus ? 'idle' : replyStatus;
