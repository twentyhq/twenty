import { useAiChatChannelIcon } from '@/ai/hooks/useAiChatChannelIcon';
import { ColoredIcon } from '@/ui/icon/components/ColoredIcon';
import { type AgentChatChannel } from '~/generated-metadata/graphql';

type AiChatChannelIconProps = {
  channel: Pick<AgentChatChannel, 'icon' | 'color'>;
  size?: number;
};

export const AiChatChannelIcon = ({
  channel,
  size,
}: AiChatChannelIconProps) => {
  const ChannelIcon = useAiChatChannelIcon(channel.icon);

  return <ColoredIcon Icon={ChannelIcon} color={channel.color} size={size} />;
};
