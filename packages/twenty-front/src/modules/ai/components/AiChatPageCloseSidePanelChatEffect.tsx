import { useStore } from 'jotai';
import { useEffect } from 'react';
import { isSidePanelItemShowingAiChat } from '@/ai/utils/isSidePanelItemShowingAiChat';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';

// The page and a chat in the side panel would share one current chat
export const AiChatPageCloseSidePanelChatEffect = () => {
  const store = useStore();
  const { closeSidePanelMenu } = useSidePanelMenu();

  useEffect(() => {
    if (!store.get(isSidePanelOpenedState.atom)) {
      return;
    }

    if (
      isSidePanelItemShowingAiChat(
        store.get(sidePanelNavigationStackState.atom).at(-1),
      )
    ) {
      void closeSidePanelMenu();
    }
  }, [store, closeSidePanelMenu]);

  return null;
};
