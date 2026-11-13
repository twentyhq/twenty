import { type InboxChannelView } from '@/ai/types/AgentChatChannelView';

export const getInboxChannelViewKey = ({
  channelId,
  channelStatus,
  assignment,
  filter,
}: InboxChannelView) => `${channelId}:${channelStatus}:${assignment}:${filter}`;
