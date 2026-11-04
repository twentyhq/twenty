import { useAgentChatChannelIcon } from '@/ai/hooks/useAgentChatChannelIcon';
import { ColoredIcon } from '@/ui/icon/components/ColoredIcon';
import { type AgentChatChannel } from '~/generated-metadata/graphql';

type AgentChatChannelIconProps = {
  channel: Pick<AgentChatChannel, 'icon' | 'color'>;
  size?: number;
};

export const AgentChatChannelIcon = ({
  channel,
  size,
}: AgentChatChannelIconProps) => {
  const ChannelIcon = useAgentChatChannelIcon(channel.icon);

  return <ColoredIcon Icon={ChannelIcon} color={channel.color} size={size} />;
};
