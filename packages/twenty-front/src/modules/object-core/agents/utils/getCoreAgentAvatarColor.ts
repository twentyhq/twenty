import { typedObjectEntries } from 'twenty-shared/utils';

import { AI_AGENT_AVATAR_COLORS } from '@/ai/constants/AiAgentAvatarColors';
import { type AiAgentAvatarColor } from '@/ai/types/AiAgentAvatarColor';

const AGENT_AVATAR_COLORS = typedObjectEntries(AI_AGENT_AVATAR_COLORS).map(
  ([color]) => color,
);

export const getCoreAgentAvatarColor = (
  agentId: string,
): AiAgentAvatarColor => {
  let hash = 0;
  for (let index = 0; index < agentId.length; index++) {
    hash = (agentId.charCodeAt(index) + ((hash << 5) - hash)) | 0;
  }

  return AGENT_AVATAR_COLORS[Math.abs(hash) % AGENT_AVATAR_COLORS.length];
};
