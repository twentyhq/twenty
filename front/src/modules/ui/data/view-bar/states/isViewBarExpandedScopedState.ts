import { atomFamily } from 'recoil';

export const isViewBarExpandedScopedState = atomFamily<boolean, string>({
  key: 'isViewBarExpandedScopedState',
  default: true,
});
