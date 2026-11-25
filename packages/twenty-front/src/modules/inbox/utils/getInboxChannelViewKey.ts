import { type InboxChannelView } from '@/inbox/types/InboxChannelView';

export const getInboxChannelViewKey = ({
  channelId,
  channelStatus,
  assignment,
  filter,
}: InboxChannelView) => `${channelId}:${channelStatus}:${assignment}:${filter}`;
