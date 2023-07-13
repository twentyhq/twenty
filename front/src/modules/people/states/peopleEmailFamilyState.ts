import { atomFamily } from 'recoil';

export const peopleEmailFamilyState = atomFamily<string | null, string>({
  key: 'peopleEmailFamilyState',
  default: null,
});
