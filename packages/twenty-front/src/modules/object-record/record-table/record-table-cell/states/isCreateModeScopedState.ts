import { atomFamily } from 'recoil';

export const isCreateModeScopedState = atomFamily<boolean, string>({
  key: 'isCreateModeScopedState',
  default: false,
});
