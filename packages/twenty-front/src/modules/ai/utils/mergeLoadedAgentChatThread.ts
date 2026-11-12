import { isDefined } from 'twenty-shared/utils';

import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';

export const mergeLoadedAgentChatThread = ({
  loadedThread,
  storedThread,
}: {
  loadedThread: AgentChatThreadRecord;
  storedThread: Partial<AgentChatThreadRecord> | null | undefined;
}): AgentChatThreadRecord => {
  if (
    !isDefined(storedThread?.updatedAt) ||
    new Date(storedThread.updatedAt) < new Date(loadedThread.updatedAt)
  ) {
    return loadedThread;
  }

  return { ...loadedThread, ...storedThread };
};
