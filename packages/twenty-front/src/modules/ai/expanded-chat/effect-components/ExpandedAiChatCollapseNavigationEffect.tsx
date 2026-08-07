import { useStore } from 'jotai';
import { useEffect } from 'react';
import { useIsMobile } from 'twenty-ui/utilities';

import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';

// The expanded chat brings its own left rail, so the navigation drawer
// collapses while it is open and comes back when leaving.
export const ExpandedAiChatCollapseNavigationEffect = () => {
  const store = useStore();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile) {
      return;
    }

    const wasNavigationDrawerExpanded = store.get(
      isNavigationDrawerExpandedState.atom,
    );

    store.set(isNavigationDrawerExpandedState.atom, false);

    return () => {
      store.set(
        isNavigationDrawerExpandedState.atom,
        wasNavigationDrawerExpanded,
      );
    };
  }, [store, isMobile]);

  return null;
};
