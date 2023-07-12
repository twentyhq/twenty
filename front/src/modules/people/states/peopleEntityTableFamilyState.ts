import { atomFamily } from 'recoil';

import { GetPeopleQuery } from '~/generated/graphql';

export const peopleEntityTableFamilyState = atomFamily<
  GetPeopleQuery['people'][0] | null,
  string
>({
  key: 'peopleEntityTableFamilyState',
  default: null,
});
