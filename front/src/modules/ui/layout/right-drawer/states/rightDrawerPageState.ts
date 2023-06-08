import { atom } from 'recoil';

import { RightDrawerPage } from '../types/RightDrawerPage';

export const rightDrawerPageState = atom<RightDrawerPage | null>({
  key: 'ui/layout/right-drawer-page',
  default: null,
});
