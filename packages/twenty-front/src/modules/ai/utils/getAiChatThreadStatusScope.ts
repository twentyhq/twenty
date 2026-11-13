import { isDefined } from 'twenty-shared/utils';

import { type AiChatChannel } from '@/ai/types/AiChatChannel';
import { type AiChatThreadStatusScope } from '@/ai/types/AiChatThreadStatusScope';

export const getAiChatThreadStatusScope = ({
  isInChannel,
  channel,
}: {
  isInChannel: boolean;
  channel: AiChatChannel | undefined;
}): AiChatThreadStatusScope | undefined => {
  if (!isInChannel) {
    return { type: 'personal' };
  }

  if (!isDefined(channel)) {
    return undefined;
  }

  return { type: 'channel', channelId: channel.id, channelName: channel.name };
};
