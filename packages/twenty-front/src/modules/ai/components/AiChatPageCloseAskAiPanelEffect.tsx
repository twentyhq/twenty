import { useStore } from 'jotai';
import { useEffect } from 'react';
import { SidePanelPages } from 'twenty-shared/types';

import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';

// The chat page shows the conversation in the main pane, so a panel left open
// on the AskAI page would show the same conversation twice.
//
// Every in-app route into this page already prevents that: the expand button
// closes the panel before navigating, and the panel's state does not survive
// a reload, so a cold deep link arrives with it closed. What remains is the
// browser's own navigation — collapsing opens the panel chat and leaves the
// page, so pressing Back returns here with it open. That makes this an
// adapter to the history stack rather than a rule about our own transitions,
// which is why it reads the panel once on mount instead of watching it: a
// handoff that opens the panel chat on the way out must not be fought.
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
