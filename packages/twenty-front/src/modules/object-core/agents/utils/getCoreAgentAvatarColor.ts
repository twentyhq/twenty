import { typedObjectEntries } from 'twenty-shared/utils';

import { AI_AGENT_AVATAR_COLORS } from '@/ai/constants/AiAgentAvatarColors';
import { type AiAgentAvatarColor } from '@/ai/types/AiAgentAvatarColor';

const AGENT_AVATAR_COLOR_NAMES = typedObjectEntries(AI_AGENT_AVATAR_COLORS).map(
  ([color]) => color,
);

export const getCoreAgentAvatarColor = (
  agentId: string,
): AiAgentAvatarColor => {
  const hash = agentId
    .split('')
    .reduce(
      (accumulatedHash, character) =>
        (character.charCodeAt(0) + ((accumulatedHash << 5) - accumulatedHash)) |
        0,
      0,
    );

  return AGENT_AVATAR_COLOR_NAMES[
    Math.abs(hash) % AGENT_AVATAR_COLOR_NAMES.length
  ];
};
