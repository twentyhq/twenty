import {
  AI_CHAT_ASSISTANT_AVATAR_COLORS,
  type AiChatAssistantAvatarColor,
} from 'twenty-shared/ai';

export const getCoreAgentAvatarColor = (
  agentId: string,
): AiChatAssistantAvatarColor => {
  const hash = agentId
    .split('')
    .reduce(
      (accumulatedHash, character) =>
        (character.charCodeAt(0) + ((accumulatedHash << 5) - accumulatedHash)) |
        0,
      0,
    );

  return AI_CHAT_ASSISTANT_AVATAR_COLORS[
    Math.abs(hash) % AI_CHAT_ASSISTANT_AVATAR_COLORS.length
  ];
};
