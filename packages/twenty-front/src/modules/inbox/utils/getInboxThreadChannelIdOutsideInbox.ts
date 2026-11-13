import { isDefined } from 'twenty-shared/utils';

import { type InboxChannel } from '@/inbox/types/InboxChannel';

export const getInboxThreadChannelIdOutsideInbox = ({
  threadChannelId,
  channels,
}: {
  threadChannelId: string | null | undefined;
  channels: InboxChannel[] | null;
}) => {
  if (!isDefined(threadChannelId)) {
    return null;
  }

  if (!isDefined(channels)) {
    return threadChannelId;
  }

  const isThreadChannelAccessible = channels.some(
    ({ id, isAccessible }) => isAccessible && id === threadChannelId,
  );

  return isThreadChannelAccessible ? threadChannelId : null;
};
