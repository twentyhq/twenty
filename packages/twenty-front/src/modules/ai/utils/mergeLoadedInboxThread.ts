import { isDefined } from 'twenty-shared/utils';

import { type InboxThreadRecord } from '@/ai/types/InboxThreadRecord';

export const mergeLoadedInboxThread = ({
  loadedThread,
  storedThread,
}: {
  loadedThread: InboxThreadRecord;
  storedThread: Partial<InboxThreadRecord> | null | undefined;
}): InboxThreadRecord => {
  if (
    !isDefined(storedThread?.updatedAt) ||
    new Date(storedThread.updatedAt) < new Date(loadedThread.updatedAt)
  ) {
    return loadedThread;
  }

  return { ...loadedThread, ...storedThread };
};
