import { isDefined } from 'twenty-shared/utils';

import { type InboxLoadedThreadList } from '@/ai/types/AgentChatThreadList';
import { type AiChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';

export const filterAiChatThreadsWithinLoadedPages = ({
  threads,
  pagedList,
}: {
  threads: AiChatThreadRecord[];
  pagedList: Pick<
    InboxLoadedThreadList,
    'threadIds' | 'hasNextPage' | 'lastLoadedActivityAt'
  > | null;
}): AiChatThreadRecord[] => {
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
