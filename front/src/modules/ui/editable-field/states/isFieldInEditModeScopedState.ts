import { atomFamily } from 'recoil';

export const isFieldInEditModeScopedState = atomFamily<boolean, string>({
  key: 'isFieldInEditModeScopedState',
  default: false,
});
