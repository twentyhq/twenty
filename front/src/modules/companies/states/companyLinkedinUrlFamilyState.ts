import { atomFamily } from 'recoil';

export const companyLinkedinUrlFamilyState = atomFamily<string | null, string>({
  key: 'companyLinkedinUrlFamilyState',
  default: null,
});
