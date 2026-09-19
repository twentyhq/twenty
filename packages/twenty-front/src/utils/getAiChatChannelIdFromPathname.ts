import { matchPath } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';

export const getAiChatChannelIdFromPathname = (pathname: string) =>
  matchPath(AppPath.AiChatChannel, pathname)?.params.channelId ?? null;
