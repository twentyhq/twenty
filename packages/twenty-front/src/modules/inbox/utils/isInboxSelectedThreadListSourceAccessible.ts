import { type AiChatChannel } from '@/ai/types/AiChatChannel';
import { type InboxSelectedThreadListSource } from '@/inbox/types/InboxSelectedThreadListSource';

export const isInboxSelectedThreadListSourceAccessible = ({
  source,
  channels,
}: {
  source: InboxSelectedThreadListSource;
  channels: Pick<AiChatChannel, 'id' | 'isAccessible'>[];
}) =>
  source.type !== 'channel' ||
  channels.some(
    ({ id, isAccessible }) =>
      isAccessible && id === source.channelView.channelId,
  );
