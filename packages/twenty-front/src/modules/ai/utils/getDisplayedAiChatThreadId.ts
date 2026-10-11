import { isDefined, isValidUuid } from 'twenty-shared/utils';

// /chat without an id shows the current chat (initially the latest); a new chat has no record yet.
export const getDisplayedAiChatThreadId = ({
  urlThreadId,
  currentAiChatThread,
  isOnNewAiChatSlot,
}: {
  urlThreadId: string | undefined;
  currentAiChatThread: string | null;
  isOnNewAiChatSlot: boolean;
}): string | null => {
  if (isDefined(urlThreadId) && isValidUuid(urlThreadId)) {
    return urlThreadId;
  }

  return isOnNewAiChatSlot ? null : currentAiChatThread;
};
