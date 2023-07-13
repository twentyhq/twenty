import { atomFamily } from 'recoil';

export const companyAddressFamilyState = atomFamily<string | null, string>({
  key: 'companyAddressFamilyState',
  default: null,
});
