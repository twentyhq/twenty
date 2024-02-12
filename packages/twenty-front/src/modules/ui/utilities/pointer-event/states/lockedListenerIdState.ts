import { atom } from 'recoil';

export const lockedListenerIdState = atom<string | null>({
  key: 'lockedListenerIdState',
  default: null,
});
