import { AppPath } from 'twenty-shared/types';

import { AI_CHAT_NEW_THREAD_PATH_SEGMENT } from '@/ai-chat/constants/AiChatNewThreadPathSegment';

export const getAiChatPageRoute = ({
  isInbox,
  threadId,
}: {
  isInbox: boolean;
  threadId: string | null;
}) =>
  isInbox
    ? {
        appPath: AppPath.AiChatInbox,
        threadId: threadId ?? AI_CHAT_NEW_THREAD_PATH_SEGMENT,
      }
    : { appPath: AppPath.AiChat, threadId };
