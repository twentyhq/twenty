import {
  type ExtendedUIMessage,
  isSilentAgentChatMessageParts,
} from 'twenty-shared/ai';

import { AGENT_MESSAGE_ROLE } from '@/ai/constants/AgentMessageRole';

export const isSilentAgentChatMessage = (message: ExtendedUIMessage): boolean =>
  message.role === AGENT_MESSAGE_ROLE.ASSISTANT &&
  isSilentAgentChatMessageParts(message.parts);
