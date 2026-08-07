import { useLocation } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';

export const useIsOnExpandedAiChatPage = () => {
  const { pathname } = useLocation();

  return pathname === AppPath.AiChat;
};
