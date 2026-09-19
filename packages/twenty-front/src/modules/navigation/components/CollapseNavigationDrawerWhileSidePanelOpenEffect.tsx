import { useStore } from 'jotai';
import { useEffect } from 'react';
import { useIsMobile } from 'twenty-ui/utilities';

import { hasFoldedNavigationDrawerForSidePanelState } from '@/navigation/states/hasFoldedNavigationDrawerForSidePanelState';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

// Rendered by a page that already splits the main window in two. A side panel
// opening over it would make a fourth column, so the drawer folds away to give
// the page its width back, and unfolds once the panel closes or the page is
// left. A drawer the reader opens again while the panel is still there stays
// open: the fold is a courtesy, not a rule to enforce against them.
export const CollapseNavigationDrawerWhileSidePanelOpenEffect = () => {
  const store = useStore();
  const isMobile = useIsMobile();
  const isSidePanelOpened = useAtomStateValue(isSidePanelOpenedState);
  const isNavigationDrawerExpanded = useAtomStateValue(
    isNavigationDrawerExpandedState,
  );

  useEffect(() => {
    // On a phone the drawer is an overlay the reader opens deliberately and
    // the panes take turns anyway, so there is no width to win back.
    if (isMobile) {
      return;
    }

    // Only a drawer this page folded is one it may unfold again.
    const hasFoldedNavigationDrawer = store.get(
      hasFoldedNavigationDrawerForSidePanelState.atom,
    );

    if (
      isSidePanelOpened &&
      isNavigationDrawerExpanded &&
      !hasFoldedNavigationDrawer
    ) {
      store.set(hasFoldedNavigationDrawerForSidePanelState.atom, true);
      store.set(isNavigationDrawerExpandedState.atom, false);

      return;
    }

    if (!isSidePanelOpened && hasFoldedNavigationDrawer) {
      store.set(hasFoldedNavigationDrawerForSidePanelState.atom, false);
      store.set(isNavigationDrawerExpandedState.atom, true);
    }
  }, [isMobile, isSidePanelOpened, isNavigationDrawerExpanded, store]);

  useEffect(
    () => () => {
      if (store.get(hasFoldedNavigationDrawerForSidePanelState.atom)) {
        store.set(hasFoldedNavigationDrawerForSidePanelState.atom, false);
        store.set(isNavigationDrawerExpandedState.atom, true);
      }
    },
    [store],
  );

  return null;
};
