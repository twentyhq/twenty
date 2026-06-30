import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

import {
  type NavigationDrawerActiveTab,
  NAVIGATION_DRAWER_TABS,
} from '@/ui/navigation/states/navigationDrawerTabs';

export const navigationDrawerActiveTabState =
  createAtomState<NavigationDrawerActiveTab>({
    key: 'navigationDrawerActiveTab',
    defaultValue: NAVIGATION_DRAWER_TABS.NAVIGATION_MENU,
  });
