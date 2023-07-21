import { atomFamily } from 'recoil';

export const peopleLinkedinUrlFamilyState = atomFamily<string | null, string>({
  key: 'peopleLinkedinUrlFamilyState',
  default: null,
});
