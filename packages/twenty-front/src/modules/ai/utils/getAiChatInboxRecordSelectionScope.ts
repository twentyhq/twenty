import { isDefined } from 'twenty-shared/utils';

import { AI_CHAT_NEW_THREAD_PATH_SEGMENT } from '@/ai/constants/AiChatNewThreadPathSegment';

type AiChatInboxRecordSelectionScope = {
  routeSelectionKey: string | undefined;
  generation: number;
};

export const getAiChatInboxRecordSelectionScope = ({
  threadId,
  locationKey,
  previousScope,
}: {
  threadId: string | undefined;
  locationKey: string;
  previousScope?: AiChatInboxRecordSelectionScope;
}): AiChatInboxRecordSelectionScope => {
  const routeSelectionKey =
    threadId === AI_CHAT_NEW_THREAD_PATH_SEGMENT ? locationKey : threadId;

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
