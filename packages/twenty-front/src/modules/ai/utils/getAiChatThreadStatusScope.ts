import { isDefined } from 'twenty-shared/utils';

import { type AgentChatChannel } from '@/ai/types/AgentChatChannel';
import { type InboxThreadStatusScope } from '@/ai/types/AiChatThreadStatusScope';

export const getInboxThreadStatusScope = ({
  isInChannel,
  channel,
}: {
  isInChannel: boolean;
  channel: AgentChatChannel | undefined;
}): InboxThreadStatusScope | undefined => {
  if (!isInChannel) {
    return { type: 'personal' };
  }

  if (!isDefined(channel)) {
    return undefined;
  }

  return { type: 'channel', channelId: channel.id, channelName: channel.name };
};
