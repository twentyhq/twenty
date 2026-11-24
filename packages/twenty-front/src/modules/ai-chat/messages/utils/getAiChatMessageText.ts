import { type ExtendedUIMessage } from 'twenty-shared/ai';

export const getAiChatMessageText = (
  message: Pick<ExtendedUIMessage, 'parts'>,
): string => message.parts.find((part) => part.type === 'text')?.text ?? '';
