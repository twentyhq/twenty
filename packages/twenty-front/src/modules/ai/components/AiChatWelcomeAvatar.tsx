import { AiAgentAvatar } from '@/ai/components/AiAgentAvatar';
import { AGENT_CHAT_ASSISTANT_COLOR } from '@/ai/constants/AgentChatAssistantColor';

const AI_CHAT_WELCOME_AVATAR_SIZE = 40;

export const AiChatWelcomeAvatar = () => (
  <AiAgentAvatar
    color={AGENT_CHAT_ASSISTANT_COLOR}
    size={AI_CHAT_WELCOME_AVATAR_SIZE}
  />
);
