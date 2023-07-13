import { atomFamily } from 'recoil';

export const companyDomainNameFamilyState = atomFamily<string | null, string>({
  key: 'companyDomainNameFamilyState',
  default: null,
});
