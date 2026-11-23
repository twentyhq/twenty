import {
  AssistantAvatar,
  type AssistantAvatarSize,
} from 'twenty-ui/components/data-display';

import { getCoreAgentAvatar } from '@/object-core/agents/utils/getCoreAgentAvatar';

type CoreAgentIconProps = {
  agentId?: string;
  avatarColor?: string | null;
  avatarShape?: string | null;
  size: AssistantAvatarSize;
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

  return <AssistantAvatar color={color} shape={shape} size={size} />;
};
