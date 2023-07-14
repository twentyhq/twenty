import { atomFamily } from 'recoil';

export const isBoardCardSelectedFamilyState = atomFamily<boolean, string>({
  key: 'isBoardCardSelectedFamilyState',
  default: false,
});
