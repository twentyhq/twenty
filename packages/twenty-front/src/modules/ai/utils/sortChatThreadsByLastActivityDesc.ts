import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { getAgentChatThreadLastActivityAt } from '@/ai/utils/getAgentChatThreadLastActivityAt';

const getLastActivityMs = (
  thread: Pick<AgentChatThreadRecord, 'lastActivityAt' | 'updatedAt'>,
): number => new Date(getAgentChatThreadLastActivityAt(thread)).getTime();

export const sortChatThreadsByLastActivityDesc = <
  T extends Pick<AgentChatThreadRecord, 'lastActivityAt' | 'updatedAt'>,
>(
  threads: T[],
): T[] =>
  threads.toSorted((a, b) => getLastActivityMs(b) - getLastActivityMs(a));
