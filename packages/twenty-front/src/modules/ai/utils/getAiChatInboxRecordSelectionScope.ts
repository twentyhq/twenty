import { isDefined } from 'twenty-shared/utils';

import { INBOX_NEW_THREAD_PATH_SEGMENT } from '@/ai/constants/AiChatNewThreadPathSegment';

type InboxRecordSelectionScope = {
  routeSelectionKey: string | undefined;
  generation: number;
};

export const getInboxRecordSelectionScope = ({
  threadId,
  locationKey,
  previousScope,
}: {
  threadId: string | undefined;
  locationKey: string;
  previousScope?: InboxRecordSelectionScope;
}): InboxRecordSelectionScope => {
  const routeSelectionKey =
    threadId === INBOX_NEW_THREAD_PATH_SEGMENT ? locationKey : threadId;

  if (
    isDefined(previousScope) &&
    previousScope.routeSelectionKey === routeSelectionKey
  ) {
    return previousScope;
  }

  return {
    routeSelectionKey,
    generation: isDefined(previousScope) ? previousScope.generation + 1 : 0,
  };
};
