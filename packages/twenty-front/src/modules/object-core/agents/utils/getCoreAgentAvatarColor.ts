import { AGENT_AVATAR_COLORS, type AgentAvatarColor } from 'twenty-shared/ai';

export const getCoreAgentAvatarColor = (agentId: string): AgentAvatarColor => {
  const hash = agentId
    .split('')
    .reduce(
      (accumulatedHash, character) =>
        (character.charCodeAt(0) + ((accumulatedHash << 5) - accumulatedHash)) |
        0,
      0,
    );

  return AGENT_AVATAR_COLORS[Math.abs(hash) % AGENT_AVATAR_COLORS.length];
};
