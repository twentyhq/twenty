import {
  getAgentChatThreadInboxScope,
  isAgentChatThreadUnread,
  isDefined,
} from 'twenty-shared/utils';

import { agentChatThreadInboxNowState } from '@/ai/states/agentChatThreadInboxNowState';
import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { hasLoadedAgentChatThreadParticipantsState } from '@/ai/states/hasLoadedAgentChatThreadParticipantsState';
import { agentChatThreadsSelector } from '@/ai/states/selectors/agentChatThreadsSelector';
import { buildAgentChatThreadInboxState } from '@/ai/utils/buildAgentChatThreadInboxState';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

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

      const participants = get(agentChatThreadParticipantsState);
      const now = new Date(get(agentChatThreadInboxNowState));

      const openThreadInboxStates = get(agentChatThreadsSelector)
        .filter((thread) => !isDefined(thread.deletedAt))
        .map((thread) =>
          buildAgentChatThreadInboxState(thread, participants[thread.id]),
        )
        .filter(
          (inboxState) =>
            getAgentChatThreadInboxScope(inboxState, now) === 'INBOX',
        );

      return {
        openThreadCount: openThreadInboxStates.length,
        hasUnreadOpenThread: openThreadInboxStates.some((inboxState) =>
          isAgentChatThreadUnread(inboxState),
        ),
      };
    },
    areEqual: (previous, next) =>
      previous.openThreadCount === next.openThreadCount &&
      previous.hasUnreadOpenThread === next.hasUnreadOpenThread,
  });
