import { atom } from 'recoil';

export const isUpsertingActivityInDBState = atom<boolean>({
  key: 'isUpsertingActivityInDBState',
  default: false,
});
