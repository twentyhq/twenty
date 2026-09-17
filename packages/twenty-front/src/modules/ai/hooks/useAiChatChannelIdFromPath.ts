import { matchPath, useLocation } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';

export const useAiChatChannelIdFromPath = () => {
  const { pathname } = useLocation();

  return matchPath(AppPath.AiChatChannel, pathname)?.params.channelId ?? null;
};
