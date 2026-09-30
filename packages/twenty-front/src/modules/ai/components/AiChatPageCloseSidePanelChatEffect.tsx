import { useStore } from 'jotai';
import { useEffect } from 'react';
import { matchPath } from 'react-router-dom';
import {
  AppPath,
  CoreObjectNameSingular,
  SidePanelPages,
} from 'twenty-shared/types';

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

    const currentSidePanelItem = store
      .get(sidePanelNavigationStackState.atom)
      .at(-1);

    const isShowingChat =
      currentSidePanelItem?.page === SidePanelPages.AskAI ||
      (currentSidePanelItem?.page === SidePanelPages.RoutedPage &&
        matchPath(
          AppPath.RecordShowPage,
          currentSidePanelItem.routedLocation.pathname,
        )?.params.objectNameSingular ===
          CoreObjectNameSingular.AgentChatThread);

    if (isShowingChat) {
      void closeSidePanelMenu();
    }
  }, [store, closeSidePanelMenu]);

  return null;
};
