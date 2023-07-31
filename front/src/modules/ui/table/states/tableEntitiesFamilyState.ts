import { atomFamily } from 'recoil';

export const tableEntitiesFamilyState = atomFamily<
  Record<string, unknown> | null,
  string
>({
  key: 'tableEntitiesFamilyState',
  default: null,
});
