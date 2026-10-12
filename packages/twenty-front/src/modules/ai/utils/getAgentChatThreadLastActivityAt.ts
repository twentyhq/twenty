import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';

// Threads created before last activity was tracked fall back to their last
// change
export const getAgentChatThreadLastActivityAt = (
  thread: Pick<AgentChatThreadRecord, 'lastActivityAt' | 'updatedAt'>,
): string => thread.lastActivityAt ?? thread.updatedAt;
