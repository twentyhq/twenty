import {
  type ExtendedUIMessage,
  isToolsOnlyAgentChatMessageParts,
} from 'twenty-shared/ai';

import { AGENT_MESSAGE_ROLE } from '@/ai-chat/messages/constants/AgentMessageRole';

export const isToolsOnlyAiChatMessage = (message: ExtendedUIMessage): boolean =>
  message.role === AGENT_MESSAGE_ROLE.ASSISTANT &&
  isToolsOnlyAgentChatMessageParts(message.parts);
