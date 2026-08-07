import { useStore } from 'jotai';
import { useEffect } from 'react';
import { MOBILE_VIEWPORT } from 'twenty-ui/theme-constants';

import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';

const isViewportMobile = () =>
  window.matchMedia(`(max-width: ${MOBILE_VIEWPORT}px)`).matches;

// The expanded chat brings its own left rail, so the navigation drawer
// collapses while it is open and comes back when leaving.
export const ExpandedAiChatCollapseNavigationEffect = () => {
  const store = useStore();

  // Mount-once on purpose, with the viewport read at act time: collapsing
  // and restoring must happen when entering and leaving the page, not on
  // breakpoint changes, otherwise resizing to mobile mid-chat would pop
  // the drawer open over the chat.
  useEffect(() => {
    if (isViewportMobile()) {
      return;
    }

    const wasNavigationDrawerExpanded = store.get(
      isNavigationDrawerExpandedState.atom,
    );

    store.set(isNavigationDrawerExpandedState.atom, false);

    return () => {
      if (isViewportMobile()) {
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
