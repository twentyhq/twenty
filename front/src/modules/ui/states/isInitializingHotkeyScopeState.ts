import { atom } from 'recoil';

export const isInitializingHotkeyScopeState = atom<boolean>({
  key: 'isInitializingHotkeyScopeState',
  default: false,
});
