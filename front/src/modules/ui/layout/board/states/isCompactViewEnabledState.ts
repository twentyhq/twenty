import { atom } from 'recoil';

export const isCompactViewEnabledState = atom<boolean>({
  key: 'isCompactViewEnabledState',
  default: false,
});
