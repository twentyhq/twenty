import { AGENT_CHAT_CHANNEL_OPEN_VIEW_ITEMS } from '@/ai/constants/AgentChatChannelOpenViewItems';
import { type AgentChatChannelView } from '@/ai/types/AgentChatChannelView';
import { AgentChatChannelThreadStatus } from '~/generated-metadata/graphql';

export const findAgentChatChannelOpenViewItem = (
  channelView: Pick<
    AgentChatChannelView,
    'channelStatus' | 'assignment' | 'filter'
  >,
) =>
  channelView.channelStatus === AgentChatChannelThreadStatus.OPEN
    ? AGENT_CHAT_CHANNEL_OPEN_VIEW_ITEMS.find(
        ({ assignment, filter }) =>
          assignment === channelView.assignment &&
          filter === channelView.filter,
      )
    : undefined;
