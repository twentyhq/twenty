import { atomFamily } from 'recoil';

export const peopleJobTitleFamilyState = atomFamily<string | null, string>({
  key: 'peopleJobTitleFamilyState',
  default: null,
});
