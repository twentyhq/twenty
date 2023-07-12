import { atomFamily } from 'recoil';

export const peopleCityFamilyState = atomFamily<string | null, string>({
  key: 'peopleCityFamilyState',
  default: null,
});
