import { IconHash, useIcons } from 'twenty-ui/icon';

import { AGENT_CHAT_CHANNEL_DEFAULT_ICON } from '@/ai/constants/AgentChatChannelDefaultIcon';

// The icon set loads lazily, so the default stands in until it has
export const useAgentChatChannelIcon = (icon: string | null | undefined) => {
  const { getIcons } = useIcons();

  return getIcons()[icon ?? AGENT_CHAT_CHANNEL_DEFAULT_ICON] ?? IconHash;
};
