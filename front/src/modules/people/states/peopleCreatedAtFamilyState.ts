import { atomFamily } from 'recoil';

export const peopleCreatedAtFamilyState = atomFamily<string | null, string>({
  key: 'peopleCreatedAtFamilyState',
  default: null,
});
