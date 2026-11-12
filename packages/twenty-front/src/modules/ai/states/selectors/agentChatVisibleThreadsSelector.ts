import { isAgentChatThreadInFilterStatus } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { agentChatThreadFilterStatusState } from '@/ai/states/agentChatThreadFilterStatusState';
import { agentChatThreadListState } from '@/ai/states/agentChatThreadListState';
import { agentChatThreadInboxStatusFamilySelector } from '@/ai/states/selectors/agentChatThreadInboxStatusFamilySelector';
import { agentChatRecentThreadsSelector } from '@/ai/states/selectors/agentChatRecentThreadsSelector';
import { agentChatThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const agentChatVisibleThreadsSelector = createAtomSelector<
  AgentChatThreadRecord[]
>({
  key: 'agentChatVisibleThreadsSelector',
  get: ({ get }) => {
    const filterStatus = get(agentChatThreadFilterStatusState);
    const agentChatThreadList = get(agentChatThreadListState);
    const listedThreadIds = new Set(agentChatThreadList?.threadIds ?? []);
    // The list holds the most recent chats, so the tab's other chats are older
    const tabOnlyThreads = (
      agentChatThreadList?.filterStatusPages?.[filterStatus]?.threadIds ?? []
    )
      .filter((threadId) => !listedThreadIds.has(threadId))
      .map((threadId) => get(agentChatThreadRecordFamilySelector, threadId))
      .filter(
        (thread): thread is AgentChatThreadRecord =>
          isDefined(thread) && !isDefined(thread.deletedAt),
      );

    return [...get(agentChatRecentThreadsSelector), ...tabOnlyThreads].filter(
      (thread) =>
        isAgentChatThreadInFilterStatus({
          thread,
          inboxStatus: get(agentChatThreadInboxStatusFamilySelector, thread.id),
          filterStatus,
        }),
    );
  },
});
