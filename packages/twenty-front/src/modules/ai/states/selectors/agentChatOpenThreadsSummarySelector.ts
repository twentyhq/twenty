import { isDefined } from 'twenty-shared/utils';

import { agentChatThreadInboxStatusFamilySelector } from '@/ai/states/selectors/agentChatThreadInboxStatusFamilySelector';
import { agentChatRecentThreadsSelector } from '@/ai/states/selectors/agentChatRecentThreadsSelector';
import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
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
      if (!isDefined(get(agentChatThreadParticipantsState))) {
        return { openThreadCount: 0, hasUnreadOpenThread: false };
      }

      const openThreadStatuses = get(agentChatRecentThreadsSelector)
        .map((thread) =>
          get(agentChatThreadInboxStatusFamilySelector, thread.id),
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
