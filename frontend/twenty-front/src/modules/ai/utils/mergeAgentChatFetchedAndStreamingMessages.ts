import { type ExtendedUIMessage } from 'twenty-shared/ai';

// The SDK's messages array is always [...seedMessages, ...newMessages]
// where seedMessages are the fetchedMessages we passed to useChat.
// SDK-generated IDs differ from server-persisted IDs, so comparing
// by ID doesn't work. Instead, slice by position: everything beyond
// the fetched count is a new streaming message.
export const mergeAgentChatFetchedAndStreamingMessages = (
  fetchedMessages: ExtendedUIMessage[],
  streamingMessages: ExtendedUIMessage[],
): ExtendedUIMessage[] => {
  const newStreamingMessages = streamingMessages.slice(fetchedMessages.length);

  return [...fetchedMessages, ...newStreamingMessages];
};
