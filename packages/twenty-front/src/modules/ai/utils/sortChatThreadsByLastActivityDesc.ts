import { type InboxThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { getInboxThreadLastActivityAt } from '@/ai/utils/getAgentChatThreadLastActivityAt';

const getLastActivityMs = (
  thread: Pick<InboxThreadRecord, 'lastActivityAt' | 'updatedAt'>,
): number => new Date(getInboxThreadLastActivityAt(thread)).getTime();

export const sortChatThreadsByLastActivityDesc = <
  T extends Pick<InboxThreadRecord, 'lastActivityAt' | 'updatedAt'>,
>(
  threads: T[],
): T[] =>
  threads.toSorted((a, b) => getLastActivityMs(b) - getLastActivityMs(a));
