import { AppPath } from 'twenty-shared/types';

import { isMatchingPathname } from '~/utils/isMatchingPathname';

export const isInboxThreadPath = (pathname: string) =>
  isMatchingPathname(pathname, AppPath.AiChat);
