import { AppPath } from 'twenty-shared/types';

import { isMatchingPathname } from '~/utils/isMatchingPathname';

// '/chat/inbox' fits '/chat/:threadId?' just as well as a thread id does, so
// the inbox has to be ruled out before the chat page claims the path.
export const isAiChatPath = (pathname: string) =>
  !isAiChatInboxPath(pathname) && isMatchingPathname(pathname, AppPath.AiChat);

export const isAiChatInboxPath = (pathname: string) =>
  isMatchingPathname(pathname, AppPath.AiChatInbox);
