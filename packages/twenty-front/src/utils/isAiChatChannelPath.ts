import { AppPath } from 'twenty-shared/types';

import { isMatchingPathname } from '~/utils/isMatchingPathname';

export const isAiChatChannelPath = (pathname: string) =>
  isMatchingPathname(pathname, AppPath.AiChatChannel);
