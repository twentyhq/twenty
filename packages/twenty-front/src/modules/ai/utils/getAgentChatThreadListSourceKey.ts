import { type InboxThreadListSource } from '@/ai/types/AgentChatThreadListSource';
import { getInboxChannelViewKey } from '@/ai/utils/getAgentChatChannelViewKey';

export const getInboxThreadListSourceKey = (
  source: InboxThreadListSource,
): string => {
  switch (source.type) {
    case 'recent':
      return 'recent';
    case 'presetFilter':
      return `presetFilter:${source.presetFilter}`;
    case 'channel':
      return `channel:${getInboxChannelViewKey(source.channelView)}`;
  }
};
