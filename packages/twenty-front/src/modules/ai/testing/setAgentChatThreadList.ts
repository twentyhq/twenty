import { type createStore } from 'jotai';

import { AGENT_CHAT_RECENT_THREAD_LIST_SOURCE } from '@/ai/constants/AgentChatRecentThreadListSource';
import { agentChatThreadListFamilyState } from '@/ai/states/agentChatThreadListFamilyState';
import { getAgentChatThreadListSourceKey } from '@/ai/utils/getAgentChatThreadListSourceKey';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';

export const setAgentChatThreadList = (
  store: ReturnType<typeof createStore>,
  threads: AgentChatThreadRecord[],
  { hasNextPage = false }: { hasNextPage?: boolean } = {},
) => {
  for (const thread of threads) {
    store.set(recordStoreFamilyState.atomFamily(thread.id), thread);
  }

  store.set(
    agentChatThreadListFamilyState.atomFamily(
      getAgentChatThreadListSourceKey(AGENT_CHAT_RECENT_THREAD_LIST_SOURCE),
    ),
    {
      threadIds: threads.map(({ id }) => id),
      hasNextPage,
      endCursor: hasNextPage ? 'cursor' : null,
      lastLoadedActivityAt: null,
    },
  );
};
