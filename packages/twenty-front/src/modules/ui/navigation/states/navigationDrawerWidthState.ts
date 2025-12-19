import { atom } from 'recoil';

import { NAVIGATION_DRAWER_CONSTRAINTS } from '@/ui/layout/resizable-panel/constants/NavigationDrawerConstraints';
import { localStorageEffect } from '~/utils/recoil/localStorageEffect';

export const NAVIGATION_DRAWER_WIDTH_VAR = '--navigation-drawer-width';

export const navigationDrawerWidthState = atom<number>({
  key: 'navigationDrawerWidth',
  default: NAVIGATION_DRAWER_CONSTRAINTS.default,
  effects: [localStorageEffect()],
});
