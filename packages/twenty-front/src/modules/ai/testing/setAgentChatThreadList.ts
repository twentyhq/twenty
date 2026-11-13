import { type createStore } from 'jotai';

import { INBOX_RECENT_THREAD_LIST_SOURCE } from '@/ai/constants/AgentChatRecentThreadListSource';
import { inboxThreadListFamilyState } from '@/ai/states/agentChatThreadListFamilyState';
import { getInboxThreadListSourceKey } from '@/ai/utils/getAgentChatThreadListSourceKey';
import { type AiChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';

export const setInboxThreadList = (
  store: ReturnType<typeof createStore>,
  threads: AiChatThreadRecord[],
  { hasNextPage = false }: { hasNextPage?: boolean } = {},
) => {
  for (const thread of threads) {
    store.set(recordStoreFamilyState.atomFamily(thread.id), thread);
  }

  store.set(
    inboxThreadListFamilyState.atomFamily(
      getInboxThreadListSourceKey(INBOX_RECENT_THREAD_LIST_SOURCE),
    ),
    {
      threadIds: threads.map(({ id }) => id),
      hasNextPage,
      endCursor: hasNextPage ? 'cursor' : null,
      lastLoadedActivityAt: null,
    },
  );
};
