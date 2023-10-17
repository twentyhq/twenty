import { atom } from 'recoil';

export const isFlexibleBackendEnabledState = atom<boolean>({
  key: 'isFlexibleBackendEnabledState',
  default: false,
});
