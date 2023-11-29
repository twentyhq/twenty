import { atomFamily } from 'recoil';

export const isCardInCompactViewFamilyState = atomFamily<boolean, string>({
  key: 'isCardInCompactViewFamilyState',
  default: true,
});
