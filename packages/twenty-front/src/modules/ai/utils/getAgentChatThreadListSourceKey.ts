import { type AgentChatThreadListSource } from '@/ai/types/AgentChatThreadListSource';
import { getAgentChatChannelViewKey } from '@/ai/utils/getAgentChatChannelViewKey';

export const getAgentChatThreadListSourceKey = (
  source: AgentChatThreadListSource,
): string => {
  switch (source.type) {
    case 'recent':
      return 'recent';
    case 'presetFilter':
      return `presetFilter:${source.presetFilter}`;
    case 'channel':
      return `channel:${getAgentChatChannelViewKey(source.channelView)}`;
  }
};
