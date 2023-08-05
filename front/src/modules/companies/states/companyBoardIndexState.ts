import { atomFamily } from 'recoil';

import { CompanyProgress } from '@/companies/types/CompanyProgress';

export const companyBoardIndexState = atomFamily<
  CompanyProgress | undefined,
  string
>({
  key: 'companyBoardIndexState',
  default: undefined,
});
