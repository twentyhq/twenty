import { AiAgentAvatar } from '@/ai/components/AiAgentAvatar';
import { getCoreAgentAvatar } from '@/object-core/agents/utils/getCoreAgentAvatar';

type CoreAgentIconProps = {
  agentId?: string;
  avatarColor?: string | null;
  avatarShape?: string | null;
  size: number;
};

export const CoreAgentIcon = ({
  agentId,
  avatarColor,
  avatarShape,
  size,
}: CoreAgentIconProps) => {
  const { color, shape } = getCoreAgentAvatar({
    agentId,
    avatarColor,
    avatarShape,
  });

  return <AiAgentAvatar color={color} shape={shape} size={size} />;
};
