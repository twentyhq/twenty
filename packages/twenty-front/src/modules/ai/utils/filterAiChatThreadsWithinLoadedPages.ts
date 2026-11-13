import { isDefined } from 'twenty-shared/utils';

import { type InboxLoadedThreadList } from '@/inbox/types/InboxLoadedThreadList';
import { type AiChatThreadRecord } from '@/ai/types/AiChatThreadRecord';

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
