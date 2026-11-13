import { isInboxPath } from '~/utils/isInboxPath';
import { isInboxThreadPath } from '~/utils/isInboxThreadPath';

export const isAiModePath = (pathname: string) =>
  isInboxThreadPath(pathname) || isInboxPath(pathname);
