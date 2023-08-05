import { atomFamily } from 'recoil';

export const genericEntitiesFamilyState = atomFamily<
  Record<string, unknown> | null,
  string
>({
  key: 'genericEntitiesFamilyState',
  default: null,
});
