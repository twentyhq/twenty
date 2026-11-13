import { INBOX_CHANNEL_OPEN_VIEW_ITEMS } from '@/ai/constants/InboxChannelOpenViewItems';
import { type InboxChannelView } from '@/ai/types/InboxChannelView';
import { AgentChatChannelThreadStatus } from '~/generated-metadata/graphql';

export const findInboxChannelOpenViewItem = (
  channelView: Pick<
    InboxChannelView,
    'channelStatus' | 'assignment' | 'filter'
  >,
) =>
  channelView.channelStatus === AgentChatChannelThreadStatus.OPEN
    ? INBOX_CHANNEL_OPEN_VIEW_ITEMS.find(
        ({ assignment, filter }) =>
          assignment === channelView.assignment &&
          filter === channelView.filter,
      )
    : undefined;
