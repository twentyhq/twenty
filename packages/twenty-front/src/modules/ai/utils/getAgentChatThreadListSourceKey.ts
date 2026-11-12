import { type AgentChatThreadListSource } from '@/ai/types/AgentChatThreadListSource';
import { getAgentChatChannelViewKey } from '@/ai/utils/getAgentChatChannelViewKey';

export const getAgentChatThreadListSourceKey = (
  source: AgentChatThreadListSource,
): string => {
  switch (source.type) {
    case 'recent':
      return 'recent';
    case 'inboxTab':
      return `inboxTab:${source.filterStatus}`;
    case 'channel':
      return `channel:${getAgentChatChannelViewKey(source.channelView)}`;
  }
};
