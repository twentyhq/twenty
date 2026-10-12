import { type ExtendedUIMessage } from 'twenty-shared/ai';

export const upsertAgentChatMessage = (
  messages: ExtendedUIMessage[],
  message: ExtendedUIMessage,
): ExtendedUIMessage[] => {
  const messageIndex = messages.findIndex(
    (existingMessage) => existingMessage.id === message.id,
  );

  if (messageIndex < 0) {
    return [...messages, message];
  }

  const updatedMessages = [...messages];

  updatedMessages[messageIndex] = message;

  return updatedMessages;
};
