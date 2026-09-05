import { type createStore } from 'jotai';

import { wasNavigationDrawerExpandedBeforeInboxPanelState } from '@/inbox/states/wasNavigationDrawerExpandedBeforeInboxPanelState';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';

// The inbox already splits the page in two; a side panel beside it would make
// four columns with the drawer, so the drawer gives way and remembers it did.
export const collapseNavigationDrawerForInboxPanel = (
  store: ReturnType<typeof createStore>,
) => {
  if (!store.get(isNavigationDrawerExpandedState.atom)) {
    return;
  }

  store.set(wasNavigationDrawerExpandedBeforeInboxPanelState.atom, true);
  store.set(isNavigationDrawerExpandedState.atom, false);
};
