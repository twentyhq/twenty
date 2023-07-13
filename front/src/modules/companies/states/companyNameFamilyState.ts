import { atomFamily } from 'recoil';

export const companyNameFamilyState = atomFamily<string | null, string>({
  key: 'companyNameFamilyState',
  default: null,
});
