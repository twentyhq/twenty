import { type createStore } from 'jotai';

import { agentChatThreadListState } from '@/ai/states/agentChatThreadListState';
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

  store.set(agentChatThreadListState.atom, {
    threadIds: threads.map(({ id }) => id),
    hasNextPage,
    endCursor: hasNextPage ? 'cursor' : null,
  });
};
