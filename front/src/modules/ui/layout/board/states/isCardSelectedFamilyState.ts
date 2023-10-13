import { atomFamily } from 'recoil';

export const isCardSelectedFamilyState = atomFamily<boolean, string>({
  key: 'isCardSelectedFamilyState',
  default: false,
});
