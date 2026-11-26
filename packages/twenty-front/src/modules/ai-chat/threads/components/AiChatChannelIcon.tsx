import { useAiChatChannelIcon } from '@/ai-chat/threads/hooks/useAiChatChannelIcon';
import { getAiChatChannelColor } from '@/ai-chat/threads/utils/getAiChatChannelColor';
import { ColoredIcon } from '@/ui/icon/components/ColoredIcon';
import { type AgentChatChannel } from '~/generated-metadata/graphql';

type AiChatChannelIconProps = {
  channel: Pick<AgentChatChannel, 'id' | 'icon' | 'color'>;
  size?: number;
};

export const AiChatChannelIcon = ({
  channel,
  size,
}: AiChatChannelIconProps) => {
  const ChannelIcon = useAiChatChannelIcon(channel.icon);

  return (
    <ColoredIcon
      Icon={ChannelIcon}
      color={getAiChatChannelColor(channel)}
      size={size}
    />
  );
};
