import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { t } from '@lingui/core/macro';
import { useCallback } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { IconSparkles } from 'twenty-ui/display';
import { v4 } from 'uuid';

export const useOpenAskAiPageInSidePanel = () => {
  const { navigateSidePanelMenu } = useSidePanelMenu();
  const isSidePanelOpened = useAtomStateValue(isSidePanelOpenedState);

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

      navigateSidePanelMenu({
        page: SidePanelPages.AskAI,
        pageTitle: t`Ask AI`,
        pageIcon: IconSparkles,
        pageId: v4(),
        resetNavigationStack: shouldReset,
      });
    },
    [navigateSidePanelMenu, isSidePanelOpened],
  );

  return {
    openAskAiPage,
  };
};
