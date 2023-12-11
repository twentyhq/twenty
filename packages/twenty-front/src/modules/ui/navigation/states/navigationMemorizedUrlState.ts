import { atom } from 'recoil';

export const navigationMemorizedUrlState = atom<string>({
  key: 'navigationMemorizedUrlState',
  default: '/',
});
