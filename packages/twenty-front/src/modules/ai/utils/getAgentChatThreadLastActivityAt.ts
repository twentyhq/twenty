import { type InboxThreadRecord } from '@/ai/types/AgentChatThreadRecord';

// Threads created before last activity was tracked fall back to their last
// change
export const getInboxThreadLastActivityAt = (
  thread: Pick<InboxThreadRecord, 'lastActivityAt' | 'updatedAt'>,
): string => thread.lastActivityAt ?? thread.updatedAt;
