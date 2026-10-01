import { type createStore } from 'jotai';

import { navigationDrawerActiveTabState } from '@/ui/navigation/states/navigationDrawerActiveTabState';
import { NAVIGATION_DRAWER_TABS } from '@/ui/navigation/states/navigationDrawerTabs';
import { isAiModePath } from '~/utils/isAiModePath';
import { isSettingsPath } from '~/utils/isSettingsPath';

// The drawer's own reading of its mode, for callers that act at call time
export const isAiNavigationDrawerModeActive = ({
  store,
  pathname,
}: {
  store: ReturnType<typeof createStore>;
  pathname: string;
}) => {
  if (isSettingsPath(pathname)) {
    return false;
  }

  return (
    isAiModePath(pathname) ||
    store.get(navigationDrawerActiveTabState.atom) ===
      NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY
  );
};
