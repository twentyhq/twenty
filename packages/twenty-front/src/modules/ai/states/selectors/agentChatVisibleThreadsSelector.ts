import { AGENT_CHAT_THREAD_FILTER_STATUS } from '@/ai/constants/AgentChatThreadFilterStatus';
import { agentChatThreadFilterStatusState } from '@/ai/states/agentChatThreadFilterStatusState';
import { agentChatThreadInboxStatusFamilySelector } from '@/ai/states/selectors/agentChatThreadInboxStatusFamilySelector';
import { agentChatRecentThreadsSelector } from '@/ai/states/selectors/agentChatRecentThreadsSelector';
import { type AgentChatThreadFilterStatus } from '@/ai/types/AgentChatThreadFilterStatus';
import { type AgentChatThreadInboxStatus } from '@/ai/types/AgentChatThreadInboxStatus';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

const INBOX_SCOPE_BY_FILTER_STATUS: Record<
  AgentChatThreadFilterStatus,
  AgentChatThreadInboxStatus['scope']
> = {
  [AGENT_CHAT_THREAD_FILTER_STATUS.ACTIVE]: 'INBOX',
  [AGENT_CHAT_THREAD_FILTER_STATUS.SNOOZED]: 'SNOOZED',
  [AGENT_CHAT_THREAD_FILTER_STATUS.DONE]: 'ARCHIVED',
};

export const agentChatVisibleThreadsSelector = createAtomSelector<
  AgentChatThreadRecord[]
>({
  key: 'agentChatVisibleThreadsSelector',
  get: ({ get }) => {
    const requiredScope =
      INBOX_SCOPE_BY_FILTER_STATUS[get(agentChatThreadFilterStatusState)];

    return get(agentChatRecentThreadsSelector).filter(
      (thread) =>
        get(agentChatThreadInboxStatusFamilySelector, thread.id).scope ===
        requiredScope,
    );
  },
});
