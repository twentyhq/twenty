import { atomFamily } from 'recoil';

export const companyCreatedAtFamilyState = atomFamily<string | null, string>({
  key: 'companyCreatedAtFamilyState',
  default: null,
});
