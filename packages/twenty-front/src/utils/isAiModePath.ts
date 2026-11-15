import { isInboxPath } from '~/utils/isInboxPath';
import { isAiChatPath } from '~/utils/isAiChatPath';

export const isAiModePath = (pathname: string) =>
  isAiChatPath(pathname) || isInboxPath(pathname);
