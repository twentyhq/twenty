import { type AiChatThreadRecord } from '@/ai/types/AiChatThreadRecord';
import { getAiChatThreadLastActivityAt } from '@/ai/utils/getAiChatThreadLastActivityAt';

const getLastActivityMs = (
  thread: Pick<AiChatThreadRecord, 'lastActivityAt' | 'updatedAt'>,
): number => new Date(getAiChatThreadLastActivityAt(thread)).getTime();

export const sortChatThreadsByLastActivityDesc = <
  T extends Pick<AiChatThreadRecord, 'lastActivityAt' | 'updatedAt'>,
>(
  threads: T[],
): T[] =>
  threads.toSorted((a, b) => getLastActivityMs(b) - getLastActivityMs(a));
