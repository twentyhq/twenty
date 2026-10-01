import { isDefined, isValidUuid } from 'twenty-shared/utils';

// /chat without an id shows the current chat, which starts as the most recent
// one; a new chat has no record to show yet
export const getDisplayedAiChatThreadId = ({
  urlThreadId,
  currentAiChatThread,
}: {
  urlThreadId: string | undefined;
  currentAiChatThread: string | null;
}): string | null => {
  if (isDefined(urlThreadId) && isValidUuid(urlThreadId)) {
    return urlThreadId;
  }

  if (isDefined(currentAiChatThread) && isValidUuid(currentAiChatThread)) {
    return currentAiChatThread;
  }

  return null;
};
