import {
  AI_CHAT_ASSISTANT_AVATAR_COLORS,
  AI_CHAT_ASSISTANT_AVATAR_SHAPES,
  type AiChatAssistantAvatarColor,
  type AiChatAssistantAvatarShape,
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
}): {
  color: AiChatAssistantAvatarColor;
  shape: AiChatAssistantAvatarShape;
} => ({
  color:
    AI_CHAT_ASSISTANT_AVATAR_COLORS.find((color) => color === avatarColor) ??
    (isDefined(agentId) ? getCoreAgentAvatarColor(agentId) : 'blue'),
  shape:
    AI_CHAT_ASSISTANT_AVATAR_SHAPES.find((shape) => shape === avatarShape) ??
    'circle',
});
