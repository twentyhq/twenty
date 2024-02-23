import { atom } from 'recoil';

export const activityIdInDrawerState = atom<string | null>({
  key: 'activityIdInDrawerState',
  default: null,
});
