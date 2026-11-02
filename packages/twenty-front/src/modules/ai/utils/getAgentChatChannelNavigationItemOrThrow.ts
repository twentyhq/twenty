import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

import { AGENT_CHAT_CHANNEL_NAVIGATION_ITEMS } from '@/ai/constants/AgentChatChannelNavigationItems';
import { type AgentChatChannelView } from '@/ai/types/AgentChatChannelView';

export const getAgentChatChannelNavigationItemOrThrow = (
  channelView: Pick<AgentChatChannelView, 'channelStatus'>,
) => {
  const navigationItem = AGENT_CHAT_CHANNEL_NAVIGATION_ITEMS.find(
    ({ channelStatus }) => channelStatus === channelView.channelStatus,
  );

  assertIsDefinedOrThrow(navigationItem);

  return navigationItem;
};
