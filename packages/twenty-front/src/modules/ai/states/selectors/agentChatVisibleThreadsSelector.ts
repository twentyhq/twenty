import { isAgentChatThreadInFilterStatus } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { agentChatThreadFilterStatusState } from '@/ai/states/agentChatThreadFilterStatusState';
import { agentChatThreadInboxStatusFamilySelector } from '@/ai/states/selectors/agentChatThreadInboxStatusFamilySelector';
import { agentChatRecentThreadsSelector } from '@/ai/states/selectors/agentChatRecentThreadsSelector';
import { agentChatShownInboxTabThreadListSelector } from '@/ai/states/selectors/agentChatShownInboxTabThreadListSelector';
import { agentChatThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const agentChatVisibleThreadsSelector = createAtomSelector<
  AgentChatThreadRecord[]
>({
  key: 'agentChatVisibleThreadsSelector',
  get: ({ get }) => {
    const filterStatus = get(agentChatThreadFilterStatusState);
    const inboxTabThreadList = get(agentChatShownInboxTabThreadListSelector);
    const inboxTabThreads = (inboxTabThreadList?.threadIds ?? [])
      .map((threadId) => get(agentChatThreadRecordFamilySelector, threadId))
      .filter(
        (thread): thread is AgentChatThreadRecord =>
          isDefined(thread) && !isDefined(thread.deletedAt),
      );
    const inboxTabThreadIds = new Set(inboxTabThreads.map(({ id }) => id));
    const lastLoadedActivityAt = inboxTabThreadList?.lastLoadedActivityAt;
    const isPastLoadedPages = (thread: AgentChatThreadRecord) =>
      isDefined(inboxTabThreadList) &&
      inboxTabThreadList.hasNextPage &&
      !inboxTabThreadIds.has(thread.id) &&
      (!isDefined(thread.lastActivityAt) ||
        (isDefined(lastLoadedActivityAt) &&
          new Date(thread.lastActivityAt).getTime() <
            new Date(lastLoadedActivityAt).getTime()));

    const threadsById = new Map(
      [...get(agentChatRecentThreadsSelector), ...inboxTabThreads].map(
        (thread) => [thread.id, thread],
      ),
    );

    return [...threadsById.values()].filter(
      (thread) =>
        !isPastLoadedPages(thread) &&
        isAgentChatThreadInFilterStatus({
          thread,
          inboxStatus: get(agentChatThreadInboxStatusFamilySelector, thread.id),
          filterStatus,
        }),
    );
  },
});
