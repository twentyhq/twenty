import { type InboxThreadListSource } from '@/ai/types/InboxThreadListSource';
import { getInboxChannelViewKey } from '@/ai/utils/getInboxChannelViewKey';

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
