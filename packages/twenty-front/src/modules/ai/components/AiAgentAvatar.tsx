import { type AgentAvatarColor, type AgentAvatarShape } from 'twenty-shared/ai';

import { AI_AGENT_AVATAR_COLORS } from '@/ai/constants/AiAgentAvatarColors';
import { AI_AGENT_AVATAR_SHAPE_PATHS } from '@/ai/constants/AiAgentAvatarShapePaths';

type AiAgentAvatarProps = {
  color: AgentAvatarColor;
  shape?: AgentAvatarShape;
  size: number;
};

export const AiAgentAvatar = ({
  color,
  shape = 'circle',
  size,
}: AiAgentAvatarProps) => {
  const { body, face } = AI_AGENT_AVATAR_COLORS[color];

  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 24 24">
      <path d={AI_AGENT_AVATAR_SHAPE_PATHS[shape]} style={{ fill: body }} />
      <rect
        x={7.44}
        y={8.88}
        width={3.12}
        height={6.24}
        rx={1.56}
        style={{ fill: face }}
      />
      <rect
        x={13.44}
        y={8.88}
        width={3.12}
        height={6.24}
        rx={1.56}
        style={{ fill: face }}
      />
    </svg>
  );
};
