import { useStore } from 'jotai';
import { useEffect } from 'react';
import { SidePanelPages } from 'twenty-shared/types';

import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { sidePanelPageSelector } from '@/side-panel/states/sidePanelPageSelector';

export const AiChatPageCloseAskAiPanelEffect = () => {
  const store = useStore();
  const { closeSidePanelMenu } = useSidePanelMenu();

  useEffect(() => {
    const isSidePanelOpened = store.get(isSidePanelOpenedState.atom);
    const sidePanelPage = store.get(sidePanelPageSelector.atom);

    if (isSidePanelOpened && sidePanelPage === SidePanelPages.AskAI) {
      void closeSidePanelMenu();
    }
  }, [store, closeSidePanelMenu]);

  return null;
};
