import { AGENT_CHAT_CHANNEL_TAB_ORDER } from '@/ai/constants/AgentChatChannelTabOrder';
import { useChatThreads } from '@/ai/hooks/useChatThreads';
import { type AgentChatChannelTab } from '@/ai/types/AgentChatChannelTab';
import { getAgentChatChannelTab } from '@/ai/utils/getAgentChatChannelTab';
import { type FlatAgentChatThread } from '@/metadata-store/types/FlatAgentChatThread';

export const useAiChatChannelThreads = (channelId: string | undefined) => {
  const { threads } = useChatThreads();

  const channelThreads = threads.filter(
    (thread) => thread.channelId === channelId,
  );

  const threadsByTab = AGENT_CHAT_CHANNEL_TAB_ORDER.reduce(
    (accumulator, tab) => {
      accumulator[tab] = channelThreads.filter(
        (thread) => getAgentChatChannelTab(thread) === tab,
      );

      return accumulator;
    },
    {} as Record<AgentChatChannelTab, FlatAgentChatThread[]>,
  );

  const countByTab = AGENT_CHAT_CHANNEL_TAB_ORDER.reduce(
    (accumulator, tab) => {
      accumulator[tab] = threadsByTab[tab].length;

      return accumulator;
    },
    {} as Record<AgentChatChannelTab, number>,
  );

  return { channelThreads, threadsByTab, countByTab };
};
