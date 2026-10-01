import { useNavigateToAiChatPage } from '@/ai/hooks/useNavigateToAiChatPage';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { hasAgentChatBeenOpenedState } from '@/ai/states/hasAgentChatBeenOpenedState';
import { isAiNavigationDrawerModeActive } from '@/navigation/utils/isAiNavigationDrawerModeActive';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { t } from '@lingui/core/macro';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { IconSparkles } from 'twenty-ui/icon';
import { v4 } from 'uuid';
import { isCurrentPathAiChatPage } from '~/utils/isCurrentPathAiChatPage';

export const useOpenAskAiPageInSidePanel = () => {
  const store = useStore();
  const { navigateSidePanelMenu } = useSidePanelMenu();
  const { navigateToAiChatPage } = useNavigateToAiChatPage();
  const isSidePanelOpened = useAtomStateValue(isSidePanelOpenedState);
  const setHasAgentChatBeenOpened = useSetAtomState(
    hasAgentChatBeenOpenedState,
  );

  const openAskAiPage = useCallback(
    ({
      resetNavigationStack,
    }: {
      resetNavigationStack?: boolean;
    } = {}) => {
      if (isCurrentPathAiChatPage()) {
        return;
      }

      // The Inbox mode shows chats full page, never in the side panel
      if (
        isAiNavigationDrawerModeActive({
          store,
          pathname: window.location.pathname,
        })
      ) {
        navigateToAiChatPage({
          threadId: store.get(currentAiChatThreadState.atom),
        });

        return;
      }

      const shouldReset =
        resetNavigationStack !== undefined
          ? resetNavigationStack
          : isSidePanelOpened;

      setHasAgentChatBeenOpened(true);

      navigateSidePanelMenu({
        page: SidePanelPages.AskAI,
        pageTitle: t`Ask AI`,
        pageIcon: IconSparkles,
        pageId: v4(),
        resetNavigationStack: shouldReset,
      });
    },
    [
      isSidePanelOpened,
      navigateSidePanelMenu,
      navigateToAiChatPage,
      setHasAgentChatBeenOpened,
      store,
    ],
  );

  return {
    openAskAiPage,
  };
};
