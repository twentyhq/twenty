import { atomFamily } from 'recoil';

export const companyEmployeesFamilyState = atomFamily<string | null, string>({
  key: 'companyEmployeesFamilyState',
  default: null,
});
