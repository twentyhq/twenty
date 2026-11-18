import { type AiChatThreadRecord } from '@/ai-chat/threads/types/AiChatThreadRecord';
import { getAiChatThreadLastActivityAt } from '@/ai-chat/threads/utils/getAiChatThreadLastActivityAt';

const getLastActivityMs = (
  thread: Pick<AiChatThreadRecord, 'lastActivityAt' | 'updatedAt'>,
): number => new Date(getAiChatThreadLastActivityAt(thread)).getTime();

export const sortChatThreadsByLastActivityDesc = <
  T extends Pick<AiChatThreadRecord, 'lastActivityAt' | 'updatedAt'>,
>(
  threads: T[],
): T[] =>
  threads.toSorted((a, b) => getLastActivityMs(b) - getLastActivityMs(a));
