import { hasAgentChatBeenOpenedState } from '@/ai/states/hasAgentChatBeenOpenedState';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { t } from '@lingui/core/macro';
import { useCallback } from 'react';
import { matchPath } from 'react-router-dom';
import { AppPath, SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconSparkles } from 'twenty-ui/icon';
import { v4 } from 'uuid';

export const useOpenAskAiPageInSidePanel = () => {
  const { navigateSidePanelMenu } = useSidePanelMenu();
  const isSidePanelOpened = useAtomStateValue(isSidePanelOpenedState);
  const setHasAgentChatBeenOpened = useSetAtomState(
    hasAgentChatBeenOpenedState,
  );

  const openAskAiPage = useCallback(
    ({
      resetNavigationStack,
      force = false,
    }: {
      resetNavigationStack?: boolean;
      // The chat page already shows the conversation in the main pane; only
      // callers that are navigating away from it may force the panel open.
      force?: boolean;
    } = {}) => {
      // Read at call time from window.location: this hook runs from hotkeys
      // and engine commands whose callbacks can outlive a route change, and
      // in contexts without a router.
      const isOnAiChatPage = isDefined(
        matchPath(AppPath.AiChat, window.location.pathname),
      );

      if (isOnAiChatPage && !force) {
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
    [navigateSidePanelMenu, isSidePanelOpened, setHasAgentChatBeenOpened],
  );

  return {
    openAskAiPage,
  };
};
