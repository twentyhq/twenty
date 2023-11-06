import { atomFamily } from 'recoil';

export const triggeredMouseDownInsideFamilyState = atomFamily<boolean, string>({
  key: 'triggeredMouseDownInsideFamilyState',
  default: false,
});
