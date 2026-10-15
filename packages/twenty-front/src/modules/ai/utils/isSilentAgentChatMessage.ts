import { isNonEmptyString } from '@sniptt/guards';
import { type ExtendedUIMessage, isNoReplyToolPart } from 'twenty-shared/ai';

export const isSilentAgentChatMessage = (message: ExtendedUIMessage): boolean =>
  message.role === 'assistant' &&
  message.parts.some(isNoReplyToolPart) &&
  !message.parts.some(
    (part) => part.type === 'text' && isNonEmptyString(part.text),
  );
