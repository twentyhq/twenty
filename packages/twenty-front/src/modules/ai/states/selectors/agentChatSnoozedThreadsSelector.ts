import { isDefined } from 'twenty-shared/utils';

import { agentChatSnoozedThreadListState } from '@/ai/states/agentChatSnoozedThreadListState';
import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { agentChatRecentThreadsSelector } from '@/ai/states/selectors/agentChatRecentThreadsSelector';
import { agentChatThreadInboxStatusFamilySelector } from '@/ai/states/selectors/agentChatThreadInboxStatusFamilySelector';
import { agentChatThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { isAgentChatThreadWithinPageBoundary } from '@/ai/utils/isAgentChatThreadWithinPageBoundary';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const agentChatSnoozedThreadsSelector = createAtomSelector<
  AgentChatThreadRecord[]
>({
  key: 'agentChatSnoozedThreadsSelector',
  get: ({ get }) => {
    const snoozedThreadList = get(agentChatSnoozedThreadListState);

    if (!isDefined(snoozedThreadList)) {
      return [];
    }

    const listedThreads = snoozedThreadList.threadIds
      .map((threadId) => get(agentChatThreadRecordFamilySelector, threadId))
      .filter(isDefined);
    const threadsById = new Map(
      [...get(agentChatRecentThreadsSelector), ...listedThreads].map(
        (thread) => [thread.id, thread],
      ),
    );
    const threads = [...threadsById.values()].filter(
      (thread) =>
        !isDefined(thread.deletedAt) &&
        get(agentChatThreadInboxStatusFamilySelector, thread.id).scope ===
          'SNOOZED',
    );

    if (!snoozedThreadList.hasNextPage) {
      return threads;
    }

    const participants = get(agentChatThreadParticipantsState);
    const { lastLoadedSortAt, lastLoadedThreadId } = snoozedThreadList;

    if (!isDefined(lastLoadedSortAt) || !isDefined(lastLoadedThreadId)) {
      const listedThreadIds = new Set(snoozedThreadList.threadIds);

      return threads.filter((thread) => listedThreadIds.has(thread.id));
    }

    return threads.filter((thread) => {
      const snoozedUntil = participants?.[thread.id]?.snoozedUntil;

      return (
        isDefined(snoozedUntil) &&
        new Date(snoozedUntil).getTime() <= new Date(lastLoadedWakeAt).getTime()
      );
    });
  },
});
