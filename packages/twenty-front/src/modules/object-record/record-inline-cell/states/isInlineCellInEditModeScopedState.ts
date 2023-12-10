import { atomFamily } from 'recoil';

export const isInlineCellInEditModeScopedState = atomFamily<boolean, string>({
  key: 'isInlineCellInEditModeScopedState',
  default: false,
});
