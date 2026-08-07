import { useStore } from 'jotai';
import { useEffect, useRef } from 'react';
import { useIsMobile } from 'twenty-ui/utilities';

import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';

// The expanded chat brings its own left rail, so the navigation drawer
// collapses while it is open and comes back when leaving.
export const ExpandedAiChatCollapseNavigationEffect = () => {
  const store = useStore();
  const isMobile = useIsMobile();
  const isMobileRef = useRef(isMobile);

  useEffect(() => {
    isMobileRef.current = isMobile;
  }, [isMobile]);

  // Mount-once on purpose: collapsing and restoring must happen when
  // entering and leaving the page, not on breakpoint changes, otherwise
  // resizing to mobile mid-chat would pop the drawer open over the chat.
  useEffect(() => {
    if (isMobileRef.current) {
      return;
    }

    const wasNavigationDrawerExpanded = store.get(
      isNavigationDrawerExpandedState.atom,
    );

    store.set(isNavigationDrawerExpandedState.atom, false);

    return () => {
      if (isMobileRef.current) {
        return;
      }

      store.set(
        isNavigationDrawerExpandedState.atom,
        wasNavigationDrawerExpanded,
      );
    };
  }, [store]);

  return null;
};
