import { atomFamily } from 'recoil';

export const isEditModeScopedState = atomFamily<boolean, string>({
  key: 'isEditModeScopedState',
  default: false,
});
