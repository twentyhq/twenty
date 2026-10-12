import { isAiChatInboxPath } from '~/utils/isAiChatInboxPath';
import { isAiChatPath } from '~/utils/isAiChatPath';

export const isAiModePath = (pathname: string) =>
  isAiChatPath(pathname) || isAiChatInboxPath(pathname);
