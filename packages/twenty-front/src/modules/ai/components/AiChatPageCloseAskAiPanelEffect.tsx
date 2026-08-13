import { useStore } from 'jotai';
import { useEffect } from 'react';
import { SidePanelPages } from 'twenty-shared/types';

import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';

export const AiChatPageCloseAskAiPanelEffect = () => {
  const store = useStore();
  const { closeSidePanelMenu } = useSidePanelMenu();

  useEffect(() => {
    const isSidePanelOpened = store.get(isSidePanelOpenedState.atom);
    const sidePanelPage = store.get(sidePanelPageState.atom);

    if (isSidePanelOpened && sidePanelPage === SidePanelPages.AskAI) {
      void closeSidePanelMenu();
    }
  }, [store, closeSidePanelMenu]);

  return null;
};
