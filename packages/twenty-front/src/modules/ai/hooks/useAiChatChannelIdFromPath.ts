import { useLocation } from 'react-router-dom';

import { getAiChatChannelIdFromPathname } from '~/utils/getAiChatChannelIdFromPathname';

export const useAiChatChannelIdFromPath = () => {
  const { pathname } = useLocation();

  return getAiChatChannelIdFromPathname(pathname);
};
