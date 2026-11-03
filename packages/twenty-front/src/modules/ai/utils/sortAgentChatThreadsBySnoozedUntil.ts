import { isDefined } from 'twenty-shared/utils';

import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { sortByProperty } from '~/utils/array/sortByProperty';

export const sortAgentChatThreadsBySnoozedUntil = ({
  threads,
  snoozedUntilByThreadId,
}: {
  threads: AgentChatThreadRecord[];
  snoozedUntilByThreadId: Record<string, string>;
}): AgentChatThreadRecord[] =>
  threads
    .filter((thread) => isDefined(snoozedUntilByThreadId[thread.id]))
    .map((thread) => ({
      thread,
      id: thread.id,
      wakeTime: new Date(snoozedUntilByThreadId[thread.id]).getTime(),
    }))
    .toSorted(sortByProperty('id', 'desc'))
    .toSorted(sortByProperty('wakeTime', 'asc'))
    .map(({ thread }) => thread);
