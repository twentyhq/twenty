import { useLocation, useNavigate } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';

import { aiChatExpandedReturnLocationState } from '@/ai/states/aiChatExpandedReturnLocationState';
import { currentMobileNavigationDrawerState } from '@/navigation/states/currentMobileNavigationDrawerState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const useOpenExpandedAiChat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setAiChatExpandedReturnLocation = useSetAtomState(
    aiChatExpandedReturnLocationState,
  );
  const setCurrentMobileNavigationDrawer = useSetAtomState(
    currentMobileNavigationDrawerState,
  );

  const isOnExpandedAiChatPage = location.pathname === AppPath.AiChat;

  const openExpandedAiChat = () => {
    if (isOnExpandedAiChatPage) {
      return;
    }

    setAiChatExpandedReturnLocation(
      `${location.pathname}${location.search}${location.hash}`,
    );
    // The expanded chat renders inside the main drawer; without this a
    // mobile user coming from settings would keep the settings drawer.
    setCurrentMobileNavigationDrawer('main');
    navigate(AppPath.AiChat);
  };

  return { openExpandedAiChat, isOnExpandedAiChatPage };
};
