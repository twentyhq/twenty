import { useLocation, useNavigate } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';

import { aiChatExpandedReturnLocationState } from '@/ai/states/aiChatExpandedReturnLocationState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const useOpenExpandedAiChat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setAiChatExpandedReturnLocation = useSetAtomState(
    aiChatExpandedReturnLocationState,
  );

  const isOnExpandedAiChatPage = location.pathname === AppPath.AiChat;

  const openExpandedAiChat = () => {
    if (isOnExpandedAiChatPage) {
      return;
    }

    setAiChatExpandedReturnLocation(
      `${location.pathname}${location.search}${location.hash}`,
    );
    navigate(AppPath.AiChat);
  };

  return { openExpandedAiChat, isOnExpandedAiChatPage };
};
