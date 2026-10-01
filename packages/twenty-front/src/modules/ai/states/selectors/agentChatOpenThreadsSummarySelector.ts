import { agentChatThreadInboxStatusFamilySelector } from '@/ai/states/selectors/agentChatThreadInboxStatusFamilySelector';
import { agentChatRecentThreadsSelector } from '@/ai/states/selectors/agentChatRecentThreadsSelector';
import { hasLoadedAgentChatThreadParticipantsState } from '@/ai/states/hasLoadedAgentChatThreadParticipantsState';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type AgentChatOpenThreadsSummary = {
  openThreadCount: number;
  hasUnreadOpenThread: boolean;
};

export const agentChatOpenThreadsSummarySelector =
  createAtomSelector<AgentChatOpenThreadsSummary>({
    key: 'agentChatOpenThreadsSummarySelector',
    get: ({ get }) => {
      if (!get(hasLoadedAgentChatThreadParticipantsState)) {
        return { openThreadCount: 0, hasUnreadOpenThread: false };
      }

      const openThreadStatuses = get(agentChatRecentThreadsSelector)
        .map((thread) =>
          get(agentChatThreadInboxStatusFamilySelector, {
            threadId: thread.id,
            lastActivityAt: thread.lastActivityAt ?? null,
          }),
        )
        .filter(({ scope }) => scope === 'INBOX');

      return {
        openThreadCount: openThreadStatuses.length,
        hasUnreadOpenThread: openThreadStatuses.some(
          ({ isUnread }) => isUnread,
        ),
      };
    },
    areEqual: isDeeplyEqual,
  });
