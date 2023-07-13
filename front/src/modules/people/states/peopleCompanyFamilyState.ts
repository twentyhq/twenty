import { atomFamily } from 'recoil';

import { GetPeopleQuery } from '~/generated/graphql';

export const peopleCompanyFamilyState = atomFamily<
  GetPeopleQuery['people'][0]['company'] | null,
  string
>({
  key: 'peopleCompanyFamilyState',
  default: null,
});
