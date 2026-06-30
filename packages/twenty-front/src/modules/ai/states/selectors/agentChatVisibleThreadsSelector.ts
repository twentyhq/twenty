import { AGENT_CHAT_THREAD_FILTER_STATUS } from '@/ai/constants/AgentChatThreadFilterStatus';
import { AGENT_CHAT_THREAD_LAST_ACTIVITY_FILTER_DAYS } from '@/ai/constants/AgentChatThreadLastActivityFilterDays';
import { agentChatThreadFilterStatusState } from '@/ai/states/agentChatThreadFilterStatusState';
import { agentChatThreadLastActivityFilterState } from '@/ai/states/agentChatThreadLastActivityFilterState';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { type FlatAgentChatThread } from '@/metadata-store/types/FlatAgentChatThread';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

export const agentChatVisibleThreadsSelector = createAtomSelector<
  FlatAgentChatThread[]
>({
  key: 'agentChatVisibleThreadsSelector',
  get: ({ get }) => {
    const storeItem = get(metadataStoreState, 'agentChatThreads');
    const allThreads = storeItem.current as FlatAgentChatThread[];
    const filterStatus = get(agentChatThreadFilterStatusState);
    const lastActivityFilter = get(agentChatThreadLastActivityFilterState);
    const lastActivityDays =
      AGENT_CHAT_THREAD_LAST_ACTIVITY_FILTER_DAYS[lastActivityFilter];

    const cutoffMs =
      lastActivityDays !== null
        ? Date.now() - lastActivityDays * MILLISECONDS_PER_DAY
        : null;

    return allThreads.filter((thread) => {
      switch (filterStatus) {
        case AGENT_CHAT_THREAD_FILTER_STATUS.ACTIVE:
          if (thread.deletedAt) return false;
          break;
        case AGENT_CHAT_THREAD_FILTER_STATUS.ARCHIVED:
          if (!thread.deletedAt) return false;
          break;
        case AGENT_CHAT_THREAD_FILTER_STATUS.ALL:
          break;
      }

      if (cutoffMs !== null) {
        const lastActivityMs = new Date(
          thread.lastMessageAt ?? thread.updatedAt,
        ).getTime();
        if (lastActivityMs < cutoffMs) return false;
      }

      return true;
    });
  },
});
