import { AI_AGENT_AVATAR_COLORS } from '@/ai/constants/AiAgentAvatarColors';
import { type AiAgentAvatarColor } from '@/ai/types/AiAgentAvatarColor';

type AiAgentAvatarProps = {
  color: AiAgentAvatarColor;
  size: number;
};

export const AiAgentAvatar = ({ color, size }: AiAgentAvatarProps) => {
  const { body, face } = AI_AGENT_AVATAR_COLORS[color];

  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 24 24">
      <circle cx={12} cy={12} r={12} style={{ fill: body }} />
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
