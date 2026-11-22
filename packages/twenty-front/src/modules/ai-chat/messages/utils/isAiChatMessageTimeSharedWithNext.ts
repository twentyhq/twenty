import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { AI_CHAT_MESSAGE_TIME_SHARING_WINDOW_IN_MS } from '@/ai-chat/messages/constants/AiChatMessageTimeSharingWindowInMs';

type TimedAiChatMessage = Pick<ExtendedUIMessage, 'metadata'>;

export const isAiChatMessageTimeSharedWithNext = ({
  message,
  nextMessage,
}: {
  message: TimedAiChatMessage;
  nextMessage: TimedAiChatMessage;
}): boolean => {
  const createdAt = message.metadata?.createdAt;
  const nextCreatedAt = nextMessage.metadata?.createdAt;

  if (!isDefined(createdAt) || !isDefined(nextCreatedAt)) {
    return false;
  }

  return (
    new Date(nextCreatedAt).getTime() - new Date(createdAt).getTime() <
    AI_CHAT_MESSAGE_TIME_SHARING_WINDOW_IN_MS
  );
};
