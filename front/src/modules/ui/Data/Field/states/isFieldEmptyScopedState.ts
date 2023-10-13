import { atomFamily } from 'recoil';

export const isFieldEmptyScopedState = atomFamily<boolean, string>({
  key: 'isFieldEmptyScopedState',
  default: false,
});
