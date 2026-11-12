import { isAgentChatThreadInFilterStatus } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { agentChatInboxTabThreadListFamilyState } from '@/ai/states/agentChatInboxTabThreadListFamilyState';
import { agentChatThreadFilterStatusState } from '@/ai/states/agentChatThreadFilterStatusState';
import { agentChatThreadInboxStatusFamilySelector } from '@/ai/states/selectors/agentChatThreadInboxStatusFamilySelector';
import { agentChatRecentThreadsSelector } from '@/ai/states/selectors/agentChatRecentThreadsSelector';
import { agentChatThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { filterAgentChatThreadsWithinLoadedPages } from '@/ai/utils/filterAgentChatThreadsWithinLoadedPages';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const agentChatInboxTabThreadsSelector = createAtomSelector<
  AgentChatThreadRecord[]
>({
  key: 'agentChatInboxTabThreadsSelector',
  get: ({ get }) => {
    const filterStatus = get(agentChatThreadFilterStatusState);
    const inboxTabThreadList = get(
      agentChatInboxTabThreadListFamilyState,
      filterStatus,
    );
    const inboxTabThreads = (inboxTabThreadList?.threadIds ?? [])
      .map((threadId) => get(agentChatThreadRecordFamilySelector, threadId))
      .filter(
        (thread): thread is AgentChatThreadRecord =>
          isDefined(thread) && !isDefined(thread.deletedAt),
      );
    const threadsById = new Map(
      [...get(agentChatRecentThreadsSelector), ...inboxTabThreads].map(
        (thread) => [thread.id, thread],
      ),
    );

    return filterAgentChatThreadsWithinLoadedPages({
      threads: [...threadsById.values()].filter((thread) =>
        isAgentChatThreadInFilterStatus({
          thread,
          inboxStatus: get(agentChatThreadInboxStatusFamilySelector, thread.id),
          filterStatus,
        }),
      ),
      pagedList: inboxTabThreadList,
    });
  },
});
