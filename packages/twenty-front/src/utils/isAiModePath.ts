import { isInboxPath } from '~/utils/isAiChatInboxPath';
import { isInboxThreadPath } from '~/utils/isAiChatPath';

export const isAiModePath = (pathname: string) =>
  isInboxThreadPath(pathname) || isInboxPath(pathname);
