import { isDefined } from 'twenty-shared/utils';

import { type AgentChatChannel } from '@/ai/types/AgentChatChannel';

export const getAiChatThreadChannelIdOutsideInbox = ({
  threadChannelId,
  channels,
}: {
  threadChannelId: string | null | undefined;
  channels: AgentChatChannel[] | null;
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
