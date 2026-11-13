import { type InboxChannel } from '@/inbox/types/InboxChannel';
import { type InboxSelectedThreadListSource } from '@/inbox/types/InboxSelectedThreadListSource';

export const isInboxSelectedThreadListSourceAccessible = ({
  source,
  channels,
}: {
  source: InboxSelectedThreadListSource;
  channels: Pick<InboxChannel, 'id' | 'isAccessible'>[];
}) =>
  source.type !== 'channel' ||
  channels.some(
    ({ id, isAccessible }) =>
      isAccessible && id === source.channelView.channelId,
  );
