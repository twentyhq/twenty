import { hasAgentChatBeenOpenedState } from '@/ai/states/hasAgentChatBeenOpenedState';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { t } from '@lingui/core/macro';
import { useCallback } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
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
    }: {
      resetNavigationStack?: boolean;
    } = {}) => {
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
