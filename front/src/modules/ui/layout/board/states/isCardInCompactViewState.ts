import { atomFamily } from 'recoil';

export const isCardInCompactViewState = atomFamily<boolean, string>({
  key: 'isCardInCompactViewState',
  default: true,
});
