import {
  AGENT_AVATAR_COLORS,
  AGENT_AVATAR_SHAPES,
  type AgentAvatarColor,
  type AgentAvatarShape,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { getCoreAgentAvatarColor } from '@/object-core/agents/utils/getCoreAgentAvatarColor';

export const getCoreAgentAvatar = ({
  agentId,
  avatarColor,
  avatarShape,
}: {
  agentId?: string;
  avatarColor?: string | null;
  avatarShape?: string | null;
}): { color: AgentAvatarColor; shape: AgentAvatarShape } => ({
  color:
    AGENT_AVATAR_COLORS.find((color) => color === avatarColor) ??
    (isDefined(agentId) ? getCoreAgentAvatarColor(agentId) : 'blue'),
  shape: AGENT_AVATAR_SHAPES.find((shape) => shape === avatarShape) ?? 'circle',
});
