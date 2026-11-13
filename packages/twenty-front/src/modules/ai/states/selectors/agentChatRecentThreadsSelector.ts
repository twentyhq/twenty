import { AGENT_CHAT_RECENT_THREAD_LIST_SOURCE } from '@/ai/constants/AgentChatRecentThreadListSource';
import { agentChatThreadListFamilyState } from '@/ai/states/agentChatThreadListFamilyState';
import { getAgentChatThreadListSourceKey } from '@/ai/utils/getAgentChatThreadListSourceKey';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { agentChatThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { isDefined } from 'twenty-shared/utils';

export const agentChatRecentThreadsSelector = createAtomSelector<
  AgentChatThreadRecord[]
>({
  key: 'agentChatRecentThreadsSelector',
  get: ({ get }) =>
    (
      get(
        agentChatThreadListFamilyState,
        getAgentChatThreadListSourceKey(AGENT_CHAT_RECENT_THREAD_LIST_SOURCE),
      )?.threadIds ?? []
    )
      .map((threadId) => get(agentChatThreadRecordFamilySelector, threadId))
      .filter(isDefined),
});
