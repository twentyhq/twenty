import { useEffect, useRef } from 'react';
import { useIsMobile } from 'twenty-ui/utilities';

import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

// Rendered by a page that already splits the main window in two. A side panel
// opening over it would make a fourth column, so the drawer folds away to give
// the page its width back, and unfolds once the panel closes or the page is
// left. A drawer the reader opens again while the panel is still there stays
// open: the fold is a courtesy, not a rule to enforce against them.
export const CollapseNavigationDrawerWhileSidePanelOpenEffect = () => {
  const isMobile = useIsMobile();
  const isSidePanelOpened = useAtomStateValue(isSidePanelOpenedState);
  const [isNavigationDrawerExpanded, setIsNavigationDrawerExpanded] =
    useAtomState(isNavigationDrawerExpandedState);
  // Only a drawer this component folded is one it may unfold again.
  const hasFoldedDrawerRef = useRef(false);
  const setIsNavigationDrawerExpandedRef = useRef(setIsNavigationDrawerExpanded);

  setIsNavigationDrawerExpandedRef.current = setIsNavigationDrawerExpanded;

  useEffect(() => {
    // On a phone the drawer is an overlay the reader opens deliberately and
    // the panes take turns anyway, so there is no width to win back.
    if (isMobile) {
      return;
    }

    if (
      isSidePanelOpened &&
      isNavigationDrawerExpanded &&
      !hasFoldedDrawerRef.current
    ) {
      hasFoldedDrawerRef.current = true;
      setIsNavigationDrawerExpanded(false);

      return;
    }

    if (!isSidePanelOpened && hasFoldedDrawerRef.current) {
      hasFoldedDrawerRef.current = false;
      setIsNavigationDrawerExpanded(true);
    }
  }, [
    isMobile,
    isSidePanelOpened,
    isNavigationDrawerExpanded,
    setIsNavigationDrawerExpanded,
  ]);

  useEffect(
    () => () => {
      if (hasFoldedDrawerRef.current) {
        hasFoldedDrawerRef.current = false;
        setIsNavigationDrawerExpandedRef.current(true);
      }
    },
    [],
  );

  return null;
};
