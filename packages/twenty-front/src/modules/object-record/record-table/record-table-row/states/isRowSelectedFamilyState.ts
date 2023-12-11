import { atomFamily } from 'recoil';

export const isRowSelectedFamilyState = atomFamily<boolean, string>({
  key: 'isRowSelectedFamilyState',
  default: false,
});
