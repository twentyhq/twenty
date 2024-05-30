import { atom } from 'recoil';

export const currentProfilingRunIndexState = atom<number>({
  key: 'currentProfilingRunIndexState',
  default: 0,
});
