import { useLocation } from 'react-router-dom';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { useOpenAgentChatChannel } from '@/ai/hooks/useOpenAgentChatChannel';
import { agentChatChannelSummariesState } from '@/ai/states/agentChatChannelSummariesState';
import { agentChatChannelsState } from '@/ai/states/agentChatChannelsState';
import { agentChatShownChannelViewSelector } from '@/ai/states/selectors/agentChatShownChannelViewSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';
import { isAiChatInboxPath } from '~/utils/isAiChatInboxPath';

// Undefined for other items, and for a channel no longer open to the member
export const useAgentChatChannelNavigationMenuItem = (
  navigationMenuItem: Pick<NavigationMenuItem, 'type' | 'agentChatChannelId'>,
) => {
  const location = useLocation();
  const agentChatChannels = useAtomStateValue(agentChatChannelsState);
  const agentChatChannelSummaries = useAtomStateValue(
    agentChatChannelSummariesState,
  );
  const agentChatShownChannelView = useAtomStateValue(
    agentChatShownChannelViewSelector,
  );
  const { openAgentChatChannel } = useOpenAgentChatChannel();

  const channel =
    navigationMenuItem.type === NavigationMenuItemType.AGENT_CHAT_CHANNEL
      ? agentChatChannels?.find(
          ({ id, isAccessible }) =>
            id === navigationMenuItem.agentChatChannelId && isAccessible,
        )
      : undefined;

  if (!isDefined(channel)) {
    return undefined;
  }

  return {
    channel,
    summary: agentChatChannelSummaries[channel.id],
    isActive:
      isAiChatInboxPath(location.pathname) &&
      agentChatShownChannelView?.channelId === channel.id,
    openChannel: () => openAgentChatChannel(channel.id),
  };
};
