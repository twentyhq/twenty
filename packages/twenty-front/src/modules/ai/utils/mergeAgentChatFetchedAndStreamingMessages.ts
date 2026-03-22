import { type ExtendedUIMessage } from 'twenty-shared/ai';

export const mergeAgentChatFetchedAndStreamingMessages = (
  fetchedMessages: ExtendedUIMessage[],
  streamingMessages: ExtendedUIMessage[],
): ExtendedUIMessage[] => {
  const fetchedMessageIds = new Set(
    fetchedMessages.map((message) => message.id),
  );

  const streamingOnlyMessages = streamingMessages.filter(
    (message) => !fetchedMessageIds.has(message.id),
  );

  return [...fetchedMessages, ...streamingOnlyMessages];
};
