import { AGENT_CHAT_THREAD_FILTER_STATUS } from '@/ai/constants/AgentChatThreadFilterStatus';
import { agentChatSnoozedThreadsSelector } from '@/ai/states/selectors/agentChatSnoozedThreadsSelector';
import { agentChatThreadFilterStatusState } from '@/ai/states/agentChatThreadFilterStatusState';
import { agentChatThreadInboxStatusFamilySelector } from '@/ai/states/selectors/agentChatThreadInboxStatusFamilySelector';
import { agentChatRecentThreadsSelector } from '@/ai/states/selectors/agentChatRecentThreadsSelector';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { isAgentChatThreadInFilterStatus } from '@/ai/utils/isAgentChatThreadInFilterStatus';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const agentChatVisibleThreadsSelector = createAtomSelector<
  AgentChatThreadRecord[]
>({
  key: 'agentChatVisibleThreadsSelector',
  get: ({ get }) => {
    const filterStatus = get(agentChatThreadFilterStatusState);

    if (filterStatus === AGENT_CHAT_THREAD_FILTER_STATUS.SNOOZED) {
      return get(agentChatSnoozedThreadsSelector);
    }

    return get(agentChatRecentThreadsSelector).filter((thread) =>
      isAgentChatThreadInFilterStatus({
        thread,
        inboxStatus: get(agentChatThreadInboxStatusFamilySelector, thread.id),
        filterStatus,
      }),
    );
  },
});
