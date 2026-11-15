import { isDefined } from 'twenty-shared/utils';

import { type AiChatThreadRecord } from '@/ai/types/AiChatThreadRecord';

export const mergeLoadedAiChatThread = ({
  loadedThread,
  storedThread,
}: {
  loadedThread: AiChatThreadRecord;
  storedThread: Partial<AiChatThreadRecord> | null | undefined;
}): AiChatThreadRecord => {
  if (
    !isDefined(storedThread?.updatedAt) ||
    new Date(storedThread.updatedAt) < new Date(loadedThread.updatedAt)
  ) {
    return loadedThread;
  }

  return { ...loadedThread, ...storedThread };
};
