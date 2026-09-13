import { AppPath } from 'twenty-shared/types';

import { isMatchingPathname } from '~/utils/isMatchingPathname';

export const isInboxPath = (pathname: string) =>
  isMatchingPathname(pathname, AppPath.InboxPage) ||
  isMatchingPathname(pathname, `${AppPath.InboxPage}/*`);
