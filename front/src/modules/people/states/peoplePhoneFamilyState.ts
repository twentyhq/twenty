import { atomFamily } from 'recoil';

export const peoplePhoneFamilyState = atomFamily<string | null, string>({
  key: 'peoplePhoneFamilyState',
  default: null,
});
