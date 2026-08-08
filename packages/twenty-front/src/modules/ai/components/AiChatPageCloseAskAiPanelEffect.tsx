import { useStore } from 'jotai';
import { useEffect } from 'react';
import { SidePanelPages } from 'twenty-shared/types';

import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';

// The chat page shows the conversation in the main pane: a side panel left
// open on the AskAI page (e.g. after expanding the panel chat) would show the
// same conversation twice. Checked on mount only, so intentional handoffs
// that open the panel chat right before leaving the page are not fought.
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
