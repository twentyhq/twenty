import { AgentChatChannelIcon } from '@/ai/components/AgentChatChannelIcon';
import { agentChatChannelsState } from '@/ai/states/agentChatChannelsState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

type NavigationMenuItemAgentChatChannelIconProps = {
  navigationMenuItem: Pick<NavigationMenuItem, 'agentChatChannelId'>;
};

export const NavigationMenuItemAgentChatChannelIcon = ({
  navigationMenuItem,
}: NavigationMenuItemAgentChatChannelIconProps) => {
  const agentChatChannels = useAtomStateValue(agentChatChannelsState);
  const channel = agentChatChannels?.find(
    ({ id }) => id === navigationMenuItem.agentChatChannelId,
  );

  return (
    <AgentChatChannelIcon
      channel={{ icon: channel?.icon ?? null, color: channel?.color ?? null }}
    />
  );
};
