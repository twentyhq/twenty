import { type AgentChatChannel } from '@/ai/types/AgentChatChannel';
import { type InboxSelectedThreadListSource } from '@/ai/types/InboxSelectedThreadListSource';

export const isInboxSelectedThreadListSourceAccessible = ({
  source,
  channels,
}: {
  source: InboxSelectedThreadListSource;
  channels: Pick<AgentChatChannel, 'id' | 'isAccessible'>[];
}) =>
  source.type !== 'channel' ||
  channels.some(
    ({ id, isAccessible }) =>
      isAccessible && id === source.channelView.channelId,
  );
