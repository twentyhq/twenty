import { isDefined, isValidUuid } from 'twenty-shared/utils';

import { INBOX_NEW_THREAD_PATH_SEGMENT } from '@/ai/constants/InboxNewThreadPathSegment';

// /chat without an id shows the current chat (initially the latest); a new chat has no record yet.
export const getDisplayedInboxThreadId = ({
  urlThreadId,
  currentInboxThread,
  isOnNewInboxSlot,
}: {
  urlThreadId: string | undefined;
  currentInboxThread: string | null;
  isOnNewInboxSlot: boolean;
}): string | null => {
  if (urlThreadId === INBOX_NEW_THREAD_PATH_SEGMENT) {
    return null;
  }

  if (isDefined(urlThreadId) && isValidUuid(urlThreadId)) {
    return urlThreadId;
  }

  return isOnNewInboxSlot ? null : currentInboxThread;
};
