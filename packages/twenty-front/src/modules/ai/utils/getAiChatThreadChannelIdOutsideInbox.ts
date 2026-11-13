import { isDefined } from 'twenty-shared/utils';

import { type AiChatChannel } from '@/ai/types/AiChatChannel';

export const getAiChatThreadChannelIdOutsideInbox = ({
  threadChannelId,
  channels,
}: {
  threadChannelId: string | null | undefined;
  channels: AiChatChannel[] | null;
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
