import { isNonEmptyString } from '@sniptt/guards';

import { getCoreAgentAvatarColor } from '@/object-core/agents/utils/getCoreAgentAvatarColor';
import { type AgentChatChannel } from '~/generated-metadata/graphql';

export const getAiChatChannelColor = (
  channel: Pick<AgentChatChannel, 'id' | 'color'>,
) =>
  isNonEmptyString(channel.color)
    ? channel.color
    : getCoreAgentAvatarColor(channel.id);
