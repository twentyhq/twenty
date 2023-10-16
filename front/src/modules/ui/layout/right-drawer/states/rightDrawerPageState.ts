import { atom } from 'recoil';

import { RightDrawerPages } from '../types/RightDrawerPages';

export const rightDrawerPageState = atom<RightDrawerPages | null>({
  key: 'ui/layout/right-drawer-page',
  default: null,
});
