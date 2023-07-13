import { atomFamily } from 'recoil';

import { CompanyAccountOnwer } from '../components/CompanyAccountOwnerCell';

export const companyAccountOwnerFamilyState = atomFamily<
  CompanyAccountOnwer['accountOwner'] | null,
  string
>({
  key: 'companyAccountOwnerFamilyState',
  default: null,
});
