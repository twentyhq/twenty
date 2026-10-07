import { isDefined } from 'twenty-shared/utils';

import { agentChatThreadInboxStatusFamilySelector } from '@/ai/states/selectors/agentChatThreadInboxStatusFamilySelector';
import { agentChatRecentThreadsSelector } from '@/ai/states/selectors/agentChatRecentThreadsSelector';
import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { isAgentChatThreadInFilterStatus } from '@/ai/utils/isAgentChatThreadInFilterStatus';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type AgentChatOpenThreadsSummary = {
  openThreadCount: number;
  hasUnreadOpenThread: boolean;
  needsInputThreadCount: number;
  hasUnreadMentionThread: boolean;
  hasUnreadAssignedThread: boolean;
};

export const agentChatOpenThreadsSummarySelector =
  createAtomSelector<AgentChatOpenThreadsSummary>({
    key: 'agentChatOpenThreadsSummarySelector',
    get: ({ get }) => {
      if (!isDefined(get(agentChatThreadParticipantsState))) {
        return {
          openThreadCount: 0,
          hasUnreadOpenThread: false,
          needsInputThreadCount: 0,
          hasUnreadMentionThread: false,
          hasUnreadAssignedThread: false,
        };
      }

      const openThreads = get(agentChatRecentThreadsSelector)
        .map((thread) => ({
          thread,
          inboxStatus: get(agentChatThreadInboxStatusFamilySelector, thread.id),
        }))
        .filter(({ inboxStatus }) => inboxStatus.scope === 'INBOX');

      return {
        openThreadCount: openThreads.length,
        hasUnreadOpenThread: openThreads.some(
          ({ inboxStatus }) => inboxStatus.isUnread,
        ),
        needsInputThreadCount: openThreads.filter((openThread) =>
          isAgentChatThreadInFilterStatus({
            ...openThread,
            filterStatus: 'needsInput',
          }),
        ).length,
        hasUnreadMentionThread: openThreads.some(
          ({ inboxStatus }) => inboxStatus.isMentioned && inboxStatus.isUnread,
        ),
        hasUnreadAssignedThread: openThreads.some(
          ({ inboxStatus }) =>
            inboxStatus.isAssignedToMe && inboxStatus.isUnread,
        ),
      };
    },
    areEqual: isDeeplyEqual,
  });
