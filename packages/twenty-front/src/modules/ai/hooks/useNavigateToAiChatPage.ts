import { AppPath } from 'twenty-shared/types';
import { isDefined, isValidUuid } from 'twenty-shared/utils';
import { useStore } from 'jotai';

import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { SIDE_PANEL_PATH_SEARCH_PARAM } from '@/side-panel/routing/constants/SidePanelPathSearchParam';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { isCurrentPathAiChatPage } from '~/utils/isCurrentPathAiChatPage';

export const useNavigateToAiChatPage = () => {
  const store = useStore();
  const navigate = useNavigateApp();
  const { closeSidePanelMenu } = useSidePanelMenu();

  const navigateToAiChatPage = ({
    threadId,
    sidePanelPath,
  }: {
    threadId?: string | null;
    // Opened in the side panel next to the chat, in the same navigation
    sidePanelPath?: string;
  } = {}) => {
    if (
      store.get(isLayoutCustomizationModeEnabledState.atom) ||
      isCurrentPathAiChatPage()
    ) {
      return;
    }

    if (!isDefined(sidePanelPath)) {
      void closeSidePanelMenu();
    }

    navigate(
      AppPath.AiChat,
      {
        threadId:
          isDefined(threadId) && isValidUuid(threadId) ? threadId : null,
      },
      isDefined(sidePanelPath)
        ? { [SIDE_PANEL_PATH_SEARCH_PARAM]: sidePanelPath }
        : undefined,
      {
        // The chat page is a main page, even when a side panel page asks for it
        surface: 'main',
        state: {
          // Read from the window rather than useLocation so that opening a new
          // chat does not require a router context from every caller of
          // useSwitchToNewAiChat, front components included.
          returnLocation: `${window.location.pathname}${window.location.search}${window.location.hash}`,
        },
      },
    );
  };

  return { navigateToAiChatPage };
};
