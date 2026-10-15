import {
  type ExtendedUIMessage,
  isSilentAgentChatMessageParts,
} from 'twenty-shared/ai';

export const isSilentAgentChatMessage = (message: ExtendedUIMessage): boolean =>
  message.role === 'assistant' && isSilentAgentChatMessageParts(message.parts);
