import { type InboxThreadListSource } from '@/inbox/types/InboxThreadListSource';
import { getInboxChannelViewKey } from '@/inbox/utils/getInboxChannelViewKey';

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
