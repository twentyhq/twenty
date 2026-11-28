import { matchPath } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { isDefined, isValidUuid } from 'twenty-shared/utils';

import { AI_CHAT_NEW_THREAD_PATH_SEGMENT } from '@/ai-chat/constants/AiChatNewThreadPathSegment';
import { type InboxRecordRouteObjectNames } from '@/ai-chat/types/InboxRecordRouteObjectNames';
import { matchInboxPath } from '@/ai-chat/utils/matchInboxPath';

export const getAiChatPageThreadId = ({
  pathname,
  newAiChatThreadId,
  inboxRecordRouteObjectNames,
}: {
  pathname: string;
  newAiChatThreadId: string;
  inboxRecordRouteObjectNames: InboxRecordRouteObjectNames | null;
}): string | null => {
  const aiChatPageMatch = matchPath(AppPath.AiChat, pathname);
  const urlThreadId = isDefined(aiChatPageMatch)
    ? aiChatPageMatch.params.threadId
    : matchInboxPath({ pathname, inboxRecordRouteObjectNames })?.threadId;

  if (isDefined(urlThreadId) && isValidUuid(urlThreadId)) {
    return urlThreadId;
  }

  if (isDefined(aiChatPageMatch)) {
    return newAiChatThreadId;
  }

  return urlThreadId === AI_CHAT_NEW_THREAD_PATH_SEGMENT
    ? newAiChatThreadId
    : null;
};
