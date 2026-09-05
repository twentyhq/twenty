import { type createStore } from 'jotai';

import { wasNavigationDrawerExpandedBeforeInboxPanelState } from '@/inbox/states/wasNavigationDrawerExpandedBeforeInboxPanelState';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';

// The drawer's expansion is a persisted preference, so a panel the inbox pushed
// it aside for must hand it back rather than leave it collapsed.
export const restoreNavigationDrawerAfterInboxPanel = (
  store: ReturnType<typeof createStore>,
) => {
  if (!store.get(wasNavigationDrawerExpandedBeforeInboxPanelState.atom)) {
    return;
  }

  store.set(wasNavigationDrawerExpandedBeforeInboxPanelState.atom, false);
  store.set(isNavigationDrawerExpandedState.atom, true);
};
