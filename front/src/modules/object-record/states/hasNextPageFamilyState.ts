import { atomFamily } from 'recoil';

export const hasNextPageFamilyState = atomFamily<boolean, string | undefined>({
  key: 'hasNextPageFamilyState',
  default: false,
});
