import { atomFamily } from 'recoil';

export const cursorFamilyState = atomFamily<string, string | undefined>({
  key: 'cursorFamilyState',
  default: '',
});
