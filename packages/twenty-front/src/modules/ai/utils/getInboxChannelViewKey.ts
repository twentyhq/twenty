import { type InboxChannelView } from '@/ai/types/InboxChannelView';

export const getInboxChannelViewKey = ({
  channelId,
  channelStatus,
  assignment,
  filter,
}: InboxChannelView) => `${channelId}:${channelStatus}:${assignment}:${filter}`;
