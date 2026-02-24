import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

import {
  type NavigationDrawerActiveTab,
  NAVIGATION_DRAWER_TABS,
} from '@/ui/navigation/states/navigationDrawerTabs';

export const navigationDrawerActiveTabState =
  createStateV2<NavigationDrawerActiveTab>({
    key: 'navigationDrawerActiveTab',
    defaultValue: NAVIGATION_DRAWER_TABS.NAVIGATION_MENU,
  });
