import { atom } from 'recoil';

export const isRightDrawerOpenState = atom<boolean>({
  key: 'ui/layout/is-right-drawer-open',
  default: false,
});
