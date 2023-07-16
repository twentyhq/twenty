import { atomFamily } from 'recoil';

export const isBoardCardFieldInEditModeScopedState = atomFamily<
  boolean,
  string
>({
  key: 'isBoardCardFieldInEditModeScopedState',
  default: false,
});
