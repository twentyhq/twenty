import { type AiChatThreadRecord } from '@/ai/types/AiChatThreadRecord';

// Threads created before last activity was tracked fall back to their last
// change
export const getAiChatThreadLastActivityAt = (
  thread: Pick<AiChatThreadRecord, 'lastActivityAt' | 'updatedAt'>,
): string => thread.lastActivityAt ?? thread.updatedAt;
