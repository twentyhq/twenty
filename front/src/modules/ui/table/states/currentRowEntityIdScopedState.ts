import { atomFamily } from 'recoil';

export const currentRowEntityIdScopedState = atomFamily<string | null, string>({
  key: 'currentRowEntityIdScopedState',
  default: null,
});
