import { atomFamily } from 'recoil';

export const entityFieldsFamilyState = atomFamily<
  Record<string, unknown> | null,
  string
>({
  key: 'entityFieldsFamilyState',
  default: null,
});
