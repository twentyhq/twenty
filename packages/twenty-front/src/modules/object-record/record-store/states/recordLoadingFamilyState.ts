import { atomFamily } from 'recoil';

export const recordLoadingFamilyState = atomFamily<boolean, string>({
  key: 'recordLoadingFamilyState',
  default: false,
});
