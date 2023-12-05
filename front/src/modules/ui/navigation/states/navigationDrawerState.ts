import { atom } from 'recoil';

export const navigationDrawerState = atom<'main' | 'settings' | ''>({
  key: 'ui/navigationDrawerState',
  default: 'main',
});
