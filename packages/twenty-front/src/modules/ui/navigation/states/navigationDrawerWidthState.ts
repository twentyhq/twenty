import { atom } from 'recoil';

import { NAVIGATION_DRAWER_CONSTRAINTS } from '@/ui/layout/resizable-panel/constants/ResizablePanelConstraints';
import { cssVariableEffect } from '~/utils/recoil/cssVariableEffect';
import { localStorageEffect } from '~/utils/recoil/localStorageEffect';

export const NAVIGATION_DRAWER_WIDTH_VAR = '--navigation-drawer-width';

export const navigationDrawerWidthState = atom<number>({
  key: 'navigationDrawerWidth',
  default: NAVIGATION_DRAWER_CONSTRAINTS.default,
  effects: [
    localStorageEffect(),
    cssVariableEffect(NAVIGATION_DRAWER_WIDTH_VAR),
  ],
});
