import { isDefined, isValidUuid } from 'twenty-shared/utils';

import { AI_CHAT_NEW_THREAD_PATH_SEGMENT } from '@/ai/constants/AiChatNewThreadPathSegment';

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
  if (urlThreadId === AI_CHAT_NEW_THREAD_PATH_SEGMENT) {
    return null;
  }

  if (isDefined(urlThreadId) && isValidUuid(urlThreadId)) {
    return urlThreadId;
  }

  return isOnNewAiChatSlot ? null : currentAiChatThread;
};
