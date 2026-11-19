import { type AgentChatThreadConversationType } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

// Live updates and favorites can store a partial thread before it is fetched
export const isAiChatThreadRecordComplete = (
  thread:
    | { conversationType?: AgentChatThreadConversationType | null }
    | null
    | undefined,
): boolean => isDefined(thread?.conversationType);
