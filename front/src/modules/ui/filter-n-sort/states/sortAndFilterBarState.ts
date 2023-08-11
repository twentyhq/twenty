import { atomFamily } from 'recoil';

export const sortAndFilterBarState = atomFamily<boolean, string>({
  key: 'sortAndFilterBarState',
  default: false,
});
