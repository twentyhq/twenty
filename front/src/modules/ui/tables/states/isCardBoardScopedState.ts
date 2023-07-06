import { atomFamily } from 'recoil';

export const isCardBoardScopedState = atomFamily<boolean, string>({
  key: 'isCardBoardScopedState',
  default: false,
});
