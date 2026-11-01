import {
  type ExtendedUIMessage,
  type ExtendedUIMessagePart,
} from 'twenty-shared/ai';

type ThreadTitleDataPart = Extract<
  ExtendedUIMessagePart,
  { type: 'data-thread-title' }
>;

const isThreadTitleDataPart = (
  part: ExtendedUIMessagePart,
): part is ThreadTitleDataPart => part.type === 'data-thread-title';

export const getAgentChatMessageThreadTitle = (message: ExtendedUIMessage) =>
  message.parts.find(isThreadTitleDataPart)?.data.title;
