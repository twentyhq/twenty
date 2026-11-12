import { isDefined } from 'twenty-shared/utils';

import { type AgentChatThreadList } from '@/ai/types/AgentChatThreadList';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';

export const filterAgentChatThreadsWithinLoadedPages = ({
  threads,
  pagedList,
}: {
  threads: AgentChatThreadRecord[];
  pagedList: Pick<
    AgentChatThreadList,
    'threadIds' | 'hasNextPage' | 'lastLoadedActivityAt'
  > | null;
}): AgentChatThreadRecord[] => {
  if (!isDefined(pagedList) || !pagedList.hasNextPage) {
    return threads;
  }

  const loadedThreadIds = new Set(pagedList.threadIds);
  const { lastLoadedActivityAt } = pagedList;

  return threads.filter(
    (thread) =>
      loadedThreadIds.has(thread.id) ||
      (isDefined(thread.lastActivityAt) &&
        (!isDefined(lastLoadedActivityAt) ||
          new Date(thread.lastActivityAt).getTime() >=
            new Date(lastLoadedActivityAt).getTime())),
  );
};
