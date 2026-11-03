import { styled } from '@linaria/react';
import { isNumber } from '@sniptt/guards';
import { type AgentAvatarColor, type AgentAvatarShape } from 'twenty-shared/ai';

import face from '@/ai/assets/agent-avatar/face-default.svg';
import { AI_AGENT_AVATAR_BODY_ASSETS } from '@/ai/constants/AiAgentAvatarBodyAssets';
import { AI_AGENT_AVATAR_PALETTE } from '@/ai/constants/AiAgentAvatarPalette';

const StyledAvatar = styled.span<{
  size: number | string;
  bodyMask: string;
  faceMask: string;
  bodyColor: string;
  faceColor: string;
}>`
  display: inline-block;
  flex-shrink: 0;
  height: ${({ size }) => (isNumber(size) ? `${size}px` : size)};
  position: relative;
  width: ${({ size }) => (isNumber(size) ? `${size}px` : size)};

  &::before,
  &::after {
    content: '';
    inset: 0;
    mask-mode: alpha;
    mask-position: center;
    mask-repeat: no-repeat;
    mask-size: contain;
    position: absolute;
  }

  &::before {
    background-color: ${({ bodyColor }) => bodyColor};
    mask-image: ${({ bodyMask }) => `url("${bodyMask}")`};
  }

  &::after {
    background-color: ${({ faceColor }) => faceColor};
    mask-image: ${({ faceMask }) => `url("${faceMask}")`};
  }
`;

type AiAgentAvatarProps = {
  color: AgentAvatarColor;
  shape?: AgentAvatarShape;
  size: number | string;
};

export const AiAgentAvatar = ({
  color,
  shape = 'circle',
  size,
}: AiAgentAvatarProps) => {
  const palette = AI_AGENT_AVATAR_PALETTE[color];

  return (
    <StyledAvatar
      aria-hidden
      size={size}
      bodyMask={AI_AGENT_AVATAR_BODY_ASSETS[shape]}
      faceMask={face}
      bodyColor={palette.body}
      faceColor={palette.face}
    />
  );
};
