import { IconLock, IconMessageCircle } from 'twenty-ui/icon';

import { AgentChatChannelVisibility } from '~/generated-metadata/graphql';

export const getAiChatChannelIcon = (visibility: AgentChatChannelVisibility) =>
  visibility === AgentChatChannelVisibility.PRIVATE
    ? IconLock
    : IconMessageCircle;
