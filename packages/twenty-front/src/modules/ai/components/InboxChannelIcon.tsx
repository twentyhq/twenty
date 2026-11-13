import { useInboxChannelIcon } from '@/ai/hooks/useInboxChannelIcon';
import { ColoredIcon } from '@/ui/icon/components/ColoredIcon';
import { type AgentChatChannel } from '~/generated-metadata/graphql';

type InboxChannelIconProps = {
  channel: Pick<AgentChatChannel, 'icon' | 'color'>;
  size?: number;
};

export const InboxChannelIcon = ({ channel, size }: InboxChannelIconProps) => {
  const ChannelIcon = useInboxChannelIcon(channel.icon);

  return <ColoredIcon Icon={ChannelIcon} color={channel.color} size={size} />;
};
