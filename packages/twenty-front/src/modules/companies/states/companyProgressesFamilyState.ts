import { atomFamily } from 'recoil';

import { CompanyProgress } from '@/companies/types/CompanyProgress';

export const companyProgressesFamilyState = atomFamily<
  CompanyProgress | undefined,
  string
>({
  key: 'companyProgressesFamilyState',
  default: undefined,
});
